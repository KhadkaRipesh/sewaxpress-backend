import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './@config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './@interceptors/transform.interceptor';
import { ServicelistModule } from './servicelist/servicelist.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => TypeormConfig,
    }),
    UsersModule,
    AuthModule,
    OtpModule,
    ServicelistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
