import { Module } from '@nestjs/common';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseToken } from './entities/firebase-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FirebaseToken])],
  controllers: [FirebaseController],
  providers: [FirebaseService],
})
export class FirebaseModule {}
