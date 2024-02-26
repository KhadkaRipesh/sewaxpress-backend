import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from 'src/otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtService, GoogleStrategy],
})
export class AuthModule {}
