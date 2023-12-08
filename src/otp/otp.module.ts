import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from './entities/otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  providers: [OtpService],
})
export class OtpModule {}
