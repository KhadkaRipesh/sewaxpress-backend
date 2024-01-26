import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Printer } from 'src/@helpers/printer';
import { SocketService } from './socket.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/@config/constants.config';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Room } from 'src/chat/entities/room.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebsocketExceptionsFilter } from 'src/@helpers/socket-exception';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly dataSource: DataSource,
    private socketService: SocketService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: Server) {
    this.socketService.all_sockets = server;
  }

  onGatewayInit() {
    console.log('Socket connection established.');
  }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(
        socket.handshake.headers.authorization || socket.handshake.auth.token,
        {
          secret: JWT_SECRET,
        },
      );
      if (!decodedToken) socket.disconnect();

      const user: User = await this.dataSource.getRepository(User).findOne({
        where: { id: decodedToken.sub },
        relations: ['rooms'],
        select: { rooms: { id: true } },
      });
      // If user doesnot exist, disconnect from socket
      if (!user) socket.disconnect();

      // set  user_id on socket
      socket.data = { user_id: user.id, role: user.role };

      // join user to room
      socket.join(user.id);

      // If user is customer
      if (socket.data.role === UserRole.CUSTOMER) {
        const rooms = await this.dataSource.getRepository(Room).find({
          where: { customer_id: user.id },
          select: ['id'],
        });
        rooms.forEach((room) => {
          socket.join(room.id);
        });
      }

      // If user is Service Provider
      else if (user.role === UserRole.SERVICE_PROVIDER) {
        const hub = await this.dataSource.getRepository(Hub).findOne({
          where: { user_id: user.id },
          select: ['id'],
        });
        const rooms = await this.dataSource.getRepository(Room).find({
          where: { hub_id: hub.id },
          select: ['id'],
        });

        rooms.forEach((room) => {
          socket.join(room.id);
        });
      }

      console.log(`Socket connected: ${socket.id}`);
    } catch (error) {
      Printer('Socket Error', error);
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Socket Disconnected: ${socket.id}`);
  }
}
