import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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
import { CreateChatDto } from 'src/chat/dto/chat.dto';
import { ChatService } from 'src/chat/chat.service';
import {
  DeleteAChatPayload,
  EmptyPayload,
  GetARoomPayload,
  GetAllChatPayload,
} from './dto/socket.dto';
import { CreateRoomDto } from 'src/chat/dto/room.dto';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { NotificationService } from 'src/notification/notification.service';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
@WebSocketGateway({ cors: true })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly dataSource: DataSource,
    private socketService: SocketService,
    private jwtService: JwtService,
    private chatService: ChatService,
    private notificationService: NotificationService,
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
        console.log('Customer joins on room:', rooms);
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
        console.log('Service provider joins on room:', rooms);
      }

      console.log(`Socket connected: ${socket.id}`);
    } catch (error) {
      Printer('Socket Error', error);
      return error;
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Socket Disconnected: ${socket.id}`);
  }

  //  CHAT SOCKET STARTS--------------------------------------------

  // create room
  @AsyncApiSub({
    channel: 'create-room',
    summary: 'Create Room',
    description: 'Please listen to createdroom',
    message: {
      payload: CreateRoomDto,
    },
  })
  @SubscribeMessage('create-room')
  async onCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CreateRoomDto,
  ) {
    const data = await this.chatService.createRoom(
      {
        id: socket.data.user_id,
        role: socket.data.role,
      },
      payload,
    );

    if (data) {
      socket.emit(`createdroom`, { success: true, data });
    } else {
      socket.emit(`createdroom`, { success: false, data: {} });
    }
  }

  // get my rooms
  @AsyncApiSub({
    channel: 'my-rooms',
    summary: 'Get My Rooms',
    description: 'Please listen to my_rooms',
    message: {
      payload: EmptyPayload,
    },
  })
  @SubscribeMessage('my-rooms')
  async onGetMyAllRooms(@ConnectedSocket() socket: Socket) {
    const data = await this.chatService.getMyAllRooms({
      id: socket.data.user_id,
      role: socket.data.role,
    });

    if (data) {
      socket.emit(`my_rooms`, { success: true, data });
    } else {
      socket.emit(`my_rooms`, { success: false, data: {} });
    }
  }

  // get a room
  @AsyncApiSub({
    channel: 'get-a-room',
    summary: 'Get A Room',
    description: 'Please listen to room',
    message: {
      payload: EmptyPayload,
    },
  })
  @SubscribeMessage('get-a-room')
  async onGetRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: GetARoomPayload,
  ) {
    const data = await this.chatService.getRoom(
      {
        id: socket.data.user_id,
        role: socket.data.role,
      },
      payload.room_id,
    );

    if (data) {
      this.socketService.all_sockets
        .to([socket.data.user_id, payload.room_id])
        .emit(`room`, { success: true, data });
    } else {
      this.socketService.all_sockets
        .to([socket.data.user_id, payload.room_id])
        .emit(`room`, { success: false, data: {} });
    }
  }

  // Get All Chats
  @AsyncApiSub({
    channel: 'get-all-chats',
    summary: 'Get All Chats',
    description: 'Please listen to all_chats',
    message: {
      payload: GetAllChatPayload,
    },
  })
  @SubscribeMessage('get-all-chats')
  async onGetMyAllMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: GetAllChatPayload,
  ) {
    const data = await this.chatService.getAllMessages(
      {
        id: socket.data.user_id,
        role: socket.data.role,
      },
      payload.room_id,
    );

    if (data) {
      this.socketService.all_sockets
        .to([socket.data.user_id, payload.room_id])
        .emit(`all_chats`, { success: true, data });
    } else {
      this.socketService.all_sockets
        .to([socket.data.user_id, payload.room_id])
        .emit(`all_chats`, { success: false, data: {} });
    }
  }

  // send message
  @AsyncApiSub({
    channel: 'send-message',
    summary: 'Send Message',
    description: 'Please listen to message',
    message: {
      payload: CreateChatDto,
    },
  })
  @SubscribeMessage('send-message')
  async onSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CreateChatDto,
  ) {
    console.log(socket.data.user_id);
    const data = await this.chatService.sendMessage(
      {
        user_id: socket.data.user_id,
        role: socket.data.role,
      },
      payload,
    );

    if (data) {
      this.socketService.all_sockets
        .to(payload.room_id)
        .emit(`message`, { success: true, data });
    } else {
      this.socketService.all_sockets
        .to(payload.room_id)
        .emit(`message`, { success: false, data: {} });
    }
  }

  // Delete message
  @AsyncApiSub({
    channel: 'delete-message',
    summary: 'Delete A Message',
    description: 'Please listen to deleted_message',
    message: {
      payload: EmptyPayload,
    },
  })
  @SubscribeMessage('delete-message')
  async onDeleteMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: DeleteAChatPayload,
  ) {
    const data = await this.chatService.deleteChat(
      {
        id: socket.data.user_id,
        role: socket.data.role,
      },
      payload.chat_id,
    );

    if (data) {
      this.socketService.all_sockets
        .to(data.room_id)
        .emit(`deleted_message`, { success: true, data });
    } else {
      this.socketService.all_sockets
        .to(data.room_id)
        .emit(`deleted_message`, { success: false, data: {} });
    }
  }

  //CHAT SOCKET ENDS--------------------------------------------
  //NOTIFICATION SOCKET STARTS--------------------------------------------

  @AsyncApiSub({
    channel: 'get-unread-notification-count',
    summary: 'Get Unread Notification Count',
    description: 'Please listen to unread_notification_count',
    message: {
      payload: EmptyPayload,
    },
  })
  @SubscribeMessage('get-unread-notification-count')
  async onGetUnReadNotificationCountByUserId(
    @ConnectedSocket() socket: Socket,
  ) {
    const data = await this.notificationService.getUnreadNotificationsCount(
      socket.data.user_id,
    );
    if (data.count || data.count === 0) {
      socket.emit(`unread_notification_count`, { success: true, data });
    } else {
      socket.emit(`unread_notification_count`, { success: false, data: {} });
    }
  }

  @AsyncApiSub({
    channel: 'read-notification',
    summary: 'read notification by user id',
    description: 'Read notification. Please listen to read_notifications',
    message: {
      payload: EmptyPayload,
    },
  })
  @SubscribeMessage('read-notification')
  async onReadNotification(@ConnectedSocket() socket: Socket) {
    const data = await this.notificationService.markAllNotificationsRead(
      socket.data.user_id,
    );

    if (data) {
      socket.emit(`read_notifications`, { success: true, data });
    } else {
      socket.emit(`read_notifications`, { success: false, data: {} });
    }
  }

  //NOTIFICATION SOCKET ENDS--------------------------------------------
}
