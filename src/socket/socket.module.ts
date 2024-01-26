import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/chat/entities/room.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { Book } from 'src/book/entities/book.entity';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Room, Hub, Book]),
    JwtModule.register({}),
    ChatModule,
  ],
  providers: [SocketService, SocketGateway],
})
export class SocketModule {}
