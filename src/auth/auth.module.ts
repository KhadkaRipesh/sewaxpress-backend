import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from 'src/otp/otp.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtService],
})
export class AuthModule {}
