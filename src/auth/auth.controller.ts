import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  CreateCustomerDTO,
  LoginUserDTO,
  PasswordCreationDTO,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from 'src/@guards/google.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/@guards/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ----------Register User by GOOGLE---------------

  @Get('register/google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerFromGoogle() {}

  @ResponseMessage(SuccessMessage.LOGGED_IN, 'Google')
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerUserFromGoogleCallBack(@GetUser() user, @Res() res: Response) {
    const value = {
      email: user._json.email,
      name: user._json.name,
    };
    const data = await this.authService.registerUserGoogle(value);
    console.log(data);
    if (data.message) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/success/google/callback?error=${data.message}`,
      );
    } else if (data.token) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/success/google/callback?access_token=${data.token}&user_type=${data.user_type}`,
      );
    }
  }

  // To create customer
  @ResponseMessage(SuccessMessage.REGISTER, 'User')
  @Post('register')
  register(@Body() payload: CreateCustomerDTO) {
    return this.authService.createUser(payload);
  }

  // To login user
  @ResponseMessage(SuccessMessage.LOGGED_IN, 'User')
  @Post('login')
  login(@Body() payload: LoginUserDTO) {
    return this.authService.login(payload);
  }

  // To create password
  @ResponseMessage(SuccessMessage.CREATE, 'Password')
  @Post('/:userId/set-password/:otp')
  @ApiOperation({ summary: 'Set your password' })
  @ApiCreatedResponse({ description: 'Password created.' })
  @ApiUnauthorizedResponse({ description: 'Failed to create password.' })
  verifyOtp(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('otp') otp: string,
    @Body() payload: PasswordCreationDTO,
  ) {
    return this.authService.setPassword(userId, payload, otp);
  }

  // Request for reseting password
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

  // For reseting password
  @ResponseMessage(SuccessMessage.CREATE, 'New password')
  @Post('/:userId/reset-password/:otp')
  @ApiOperation({
    summary: 'Reset the password from the api.',
  })
  @ApiOkResponse({
    description: 'The password has been reset successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Password not matched.',
  })
  resetPassword(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('otp') otp: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(userId, payload, otp);
  }

  // To create password
  @ResponseMessage(SuccessMessage.CHANGE, 'Password')
  @Post('/change-password')
  @ApiOperation({ summary: 'Change your password' })
  @ApiOkResponse({ description: 'Password Changed.' })
  @ApiUnauthorizedResponse({ description: 'Failed to change password.' })
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() payload: ChangePasswordDto,
    @GetUser('id') user_id: string,
  ) {
    return this.authService.changePassword(payload, user_id);
  }
}
