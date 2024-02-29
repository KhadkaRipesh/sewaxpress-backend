import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as argon from 'argon2';
import {
  CreateCustomerDTO,
  LoginUserDTO,
  PasswordCreationDTO,
  ResetPasswordDto,
  ResetPasswordRequestDTO,
} from './dto/auth.dto';
import { AuthType, User, UserRole } from 'src/users/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { OTPType } from 'src/otp/entities/otp.entity';
import { defaultMailTemplate } from 'src/@utils/mail-template';
import { sendMail } from 'src/@helpers/mail';
import { JwtService } from '@nestjs/jwt';
import { BASE_URL, GOOGLE, JWT_SECRET } from 'src/@config/constants.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  // XXXXXXXXXXXXXXXXXX-------REGISTER USER-------XXXXXXXXXXXXXXXXXX
  async createUser(payload: CreateCustomerDTO) {
    const { email, role, ...extra } = payload;
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
        role,
        ...extra,
      });
    // Generate and send OTP
    const otp = await this.otpService.createOtp(
      savedUser.id,
      OTPType.emailVerification,
    );
    const linkToCreatePassword = `${BASE_URL.frontend}/${savedUser.id}/set-password/${otp.code}`;
    sendMail({
      to: email,
      subject: 'Welcome To SewaXpress',
      html: defaultMailTemplate({
        title: 'Create Your Password',
        name: savedUser.full_name,
        message: `Click the below link to create password : \n ${linkToCreatePassword}`,
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

  // XXXXXXXXXXXXXXXXXX-------SET PASSWORD-------XXXXXXXXXXXXXXXXXX
  async setPassword(userId: string, payload: PasswordCreationDTO, otp: string) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found.');

    const isValid = await this.otpService.validateOtp(
      user.id,
      otp,
      OTPType.emailVerification,
    );
    console.log(isValid);
    if (!isValid) throw new BadRequestException('You cannot set password.');
    if (payload.password === payload.re_password) {
      (user.password = await argon.hash(payload.password)),
        (user.is_verified = true);
    } else {
      throw new BadRequestException('Password doesnot matched.');
    }
    await this.dataSource.getRepository(User).save(user);
    if (OTPType.emailVerification) {
      await this.otpService.deleteOtp(user.id, otp, OTPType.emailVerification);
    }
    if (OTPType.passwordReset) {
      await this.otpService.deleteOtp(user.id, otp, OTPType.passwordReset);
    }

    return user.full_name;
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

    const linkToResetPassword = `${BASE_URL.frontend}/${user.id}/set-password/${otp.code}`;

    // New OTP Sended------------------
    sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `Click the below link to reset password : \n ${linkToResetPassword}`,
    });
    return true;
  }

  // XXXXXXXXXXXXXXXXXX-------Reset password-------XXXXXXXXXXXXXXXXXX
  async resetPassword(userId: string, payload: ResetPasswordDto, otp: string) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found.');

    const isValid = await this.otpService.validateOtp(
      user.id,
      otp,
      OTPType.passwordReset,
    );
    if (!isValid) throw new BadRequestException('You cannot reset password.');
    if (payload.password === payload.re_password) {
      user.password = await argon.hash(payload.password);
    } else {
      throw new BadRequestException('Password doesnot matched.');
    }
    await this.dataSource.getRepository(User).save(user);
    await this.otpService.deleteOtp(user.id, otp, OTPType.passwordReset);
  }

  // ---------Registration fro the gmail
  async registerUserGoogle({ email, name }: { email: string; name: string }) {
    //  ---------Checking existence of user--------
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    //  --------------If user already exixts-----------------
    if (user && user.auth_type == AuthType.EMAIL) {
      return { message: 'Email already used on this application.' };
    }
    //  -----Created new user if there is no existance of the user---------
    if (!user) {
      const user = new User();
      user.full_name = name;
      user.email = email;
      user.password = await argon.hash(GOOGLE.password);
      user.is_verified = true;
      user.role = UserRole.CUSTOMER;
      user.auth_type = AuthType.GOOGLE;

      //  ----------------------Saving User on database------------------
      await this.dataSource.getRepository(User).save(user);
    }
    const newUser = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    //  -------------------------Generating token--------------------------
    const token = await this.jwtService.signAsync(
      { sub: newUser.id },
      { expiresIn: '1d', secret: JWT_SECRET },
    );

    return {
      token,
      user_type: newUser.role,
    };
  }
}
