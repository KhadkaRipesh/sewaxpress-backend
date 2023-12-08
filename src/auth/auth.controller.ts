import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateCustomerDTO,
  EmailVerificationDTO,
  LoginUserDTO,
  ResendEmailVerificationCodeDTO,
  ResetPasswordDto,
  ResetPasswordRequestDTO,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ResponseMessage(SuccessMessage.REGISTER, 'User')
  @Post('register')
  register(@Body() payload: CreateCustomerDTO) {
    console.log(payload);
    return this.authService.createUser(payload);
  }

  @ResponseMessage(SuccessMessage.LOGGED_IN, 'User')
  @Post('login')
  login(@Body() payload: LoginUserDTO) {
    return this.authService.login(payload);
  }

  @ResponseMessage(SuccessMessage.VERIFY, 'Email')
  @Post('email-verification')
  @ApiOperation({ summary: 'Verify otp code.' })
  @ApiCreatedResponse({ description: 'Account verified.' })
  @ApiUnauthorizedResponse({ description: 'Failed to verify an otp code.' })
  verifyOtp(@Body() payload: EmailVerificationDTO) {
    return this.authService.emailVerification(payload);
  }

  @ResponseMessage(SuccessMessage.SENT, 'Email OTP')
  @Post('resend-email-verification')
  @ApiOperation({ summary: 'Resend Email OTP' })
  @ApiCreatedResponse({ description: 'OTP sent.' })
  @ApiBadRequestResponse({
    description: 'User already verified or email doesnot exists',
  })
  resendEmailVerification(@Body() payload: ResendEmailVerificationCodeDTO) {
    return this.authService.resendEmailVerification(payload);
  }

  @ResponseMessage(SuccessMessage.SENT, 'Reset Email OTP')
  @Post('/reset-request')
  @ApiOperation({
    summary: 'Get the otp to recover the password.',
  })
  @ApiCreatedResponse({
    description: 'OTP has been succesfully sent to the email.',
  })
  @ApiNotFoundResponse({
    description: 'The email is invalid.',
  })
  resetPasswordRequest(@Body() payload: ResetPasswordRequestDTO) {
    return this.authService.passwordForgotRequest(payload);
  }

  @ResponseMessage(SuccessMessage.CREATE, 'New password')
  @Post('/reset')
  @ApiOperation({
    summary: 'Reset the password from the api.',
  })
  @ApiOkResponse({
    description: 'The password has been reset successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid OTP or Password not matched.',
  })
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }
}
