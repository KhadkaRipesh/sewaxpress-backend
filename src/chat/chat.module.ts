import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Room } from './entities/room.entity';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Room])],
  controllers: [ChatController],
  providers: [ChatService, FirebaseService],
  exports: [ChatService],
})
export class ChatModule {}
