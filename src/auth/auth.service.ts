import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as argon from 'argon2';
import {
  CreateCustomerDTO,
  EmailVerificationDTO,
  LoginUserDTO,
  ResendEmailVerificationCodeDTO,
  ResetPasswordDto,
  ResetPasswordRequestDTO,
} from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { OTPType } from 'src/otp/entities/otp.entity';
import { defaultMailTemplate } from 'src/@utils/mail-template';
import { sendMail } from 'src/@helpers/mail';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  // XXXXXXXXXXXXXXXXXX-------REGISTER USER-------XXXXXXXXXXXXXXXXXX

  async createUser(payload: CreateCustomerDTO) {
    const { email, password, role, ...extra } = payload;
    const emailExist = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });
    if (emailExist)
      throw new BadRequestException({ message: 'Email already exists.' });
    // Register new user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...savedUser } = await this.dataSource
      .getRepository(User)
      .save({
        email,
        password: await argon.hash(password),
        role,
        ...extra,
      });
    // Generate and send OTP
    const otp = await this.otpService.createOtp(
      savedUser.id,
      OTPType.emailVerification,
    );
    sendMail({
      to: email,
      subject: 'Email Verification',
      html: defaultMailTemplate({
        title: 'Email Verification',
        name: savedUser.full_name,
        message: `Your OTP is ${otp.code}`,
      }),
    });
    return {
      user: savedUser,
    };
  }

  // XXXXXXXXXXXXXXXXXX-------LOGIN USER-------XXXXXXXXXXXXXXXXXX
  async login(payload: LoginUserDTO) {
    const { email, password } = payload;

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      select: ['id', 'is_verified', 'password', 'role'],
    });
    if (!user) throw new UnauthorizedException('Invalid Credentials.');

    // Validate Password
    const validPassword = await argon.verify(user.password, password);

    if (!validPassword) throw new UnauthorizedException('Invalid Credentials.');

    // Check user verification
    if (!user.is_verified) {
      throw new BadRequestException(
        'Your email is not verified yet. Please go to verification process.',
      );
    }

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        expiresIn: '15d',
        secret: process.env.JWT_SECRET,
      },
    );
    return {
      access_token,
      is_verified: user.is_verified,
      role: user.role,
      user_id: user.id,
    };
  }

  // XXXXXXXXXXXXXXXXXX-------Email Verification-------XXXXXXXXXXXXXXXXXX
  async emailVerification(payload: EmailVerificationDTO) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email: payload.email } });
    if (!user) throw new BadRequestException('User not found.');

    if (user.is_verified)
      throw new BadRequestException('User is already verified.');

    const isValid = await this.otpService.validateOtp(
      user.id,
      payload.code,
      OTPType.emailVerification,
    );
    if (!isValid) throw new BadRequestException('Invalid OTP');

    user.is_verified = true;
    await this.dataSource.getRepository(User).save(user);
    await this.otpService.deleteOtp(
      user.id,
      payload.code,
      OTPType.emailVerification,
    );

    return payload.email;
  }

  // XXXXXXXXXXXXXXXXXX-------Resend email verification-------XXXXXXXXXXXXXXXXXX
  async resendEmailVerification(input: ResendEmailVerificationCodeDTO) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email: input.email } });
    if (!user) throw new NotFoundException('User with the email not found');
    if (user.is_verified)
      throw new BadRequestException('User already verified.');

    const previousOtp = await this.otpService.findLastOtp(
      user.id,
      OTPType.emailVerification,
    );

    if (previousOtp) {
      const waitTime = 1000 * 60 * 1; // resend only after one minute
      const completedWaitTime =
        previousOtp.created_at.getTime() + waitTime < Date.now();
      if (!completedWaitTime) {
        throw new BadRequestException('Please request OTP after one minute.');
      }
    }

    // send email with OTP
    const otp = await this.otpService.createOtp(
      user.id,
      OTPType.emailVerification,
    );

    sendMail({
      to: input.email,
      subject: 'Email Verification',
      html: defaultMailTemplate({
        title: 'Email Verification',
        name: user.full_name ?? 'User',
        message: `Your OTP is ${otp.code}`,
      }),
    });

    return { message: 'Email verification OTP has been resent.' };
  }

  // XXXXXXXXXXXXXXXXXX-------Reset password request-------XXXXXXXXXXXXXXXXXX
  async passwordForgotRequest(payload: ResetPasswordRequestDTO) {
    const { email } = payload;
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException(
        'The user with the following email doesnot exists.',
      );
    }

    //recreating new OTP---------------
    const otp = await this.otpService.createOtp(user.id, OTPType.passwordReset);

    // New OTP Sended------------------
    sendMail({
      to: email,
      subject: 'Password Request',
      html: `Your otp for password reset is ${otp.code}`,
    });
    return `Password Reset OTP has been successfully sent to ${user.email}`;
  }

  // XXXXXXXXXXXXXXXXXX-------Reset password-------XXXXXXXXXXXXXXXXXX
  async resetPassword(payload: ResetPasswordDto) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email: payload.email } });

    // Checking OTP existance ---------
    if (!user) {
      throw new BadRequestException('User not esxist.');
    }

    // Hashing New Password-----------
    user.password = await argon.hash(payload.new_password);
    await this.dataSource.getRepository(User).save(user);
    await this.otpService.deleteOtp(
      user.id,
      payload.code,
      OTPType.passwordReset,
    );

    return `Password reset Successfully of ${user.email}`;
  }
}
