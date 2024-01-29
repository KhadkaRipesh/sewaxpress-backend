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
import { CartModule } from './cart/cart.module';
import { PreferencesModule } from './preferences/preferences.module';
import { ServiceModule } from './services/service.module';
import { HubModule } from './hub/hub.module';
import { BookModule } from './book/book.module';
import { IncomeTaxModule } from './income-tax/income-tax.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { TransactionModule } from './transaction/transaction.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => TypeormConfig,
    }),
    UsersModule,
    AuthModule,
    OtpModule,
    ServiceModule,
    CartModule,
    PreferencesModule,
    HubModule,
    BookModule,
    IncomeTaxModule,
    ChatModule,
    SocketModule,
    TransactionModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
