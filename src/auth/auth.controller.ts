import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // To create customer
  @ResponseMessage(SuccessMessage.REGISTER, 'User')
  @Post('register')
  register(@Body() payload: CreateCustomerDTO) {
    console.log(payload);
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
}
