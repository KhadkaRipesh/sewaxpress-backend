import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { CreateRoomDto } from './dto/room.dto';
import { Room } from './entities/room.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { Chat } from './entities/chat.entity';
import { BASE_URL } from 'src/@config/constants.config';
import { CreateChatDto, CreateFileAndChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly dataSource: DataSource) {}

  async createRoom(
    user: { id: string; role: UserRole },
    payload: CreateRoomDto,
  ) {
    console.log('Hello');
    if (user.id !== payload.customer_id)
      throw new UnauthorizedException('You are not authorized.');

    const existingRoom = await this.dataSource.getRepository(Room).findOne({
      where: { customer_id: payload.customer_id, hub_id: payload.hub_id },
    });

    if (existingRoom) {
      return {
        message: 'A room already exists between this customer and hub.',
        ...existingRoom,
      };
    } else {
      //check if customer and hub exists
      const hub = await this.dataSource
        .getRepository(Hub)
        .findOne({ where: { id: payload.hub_id } });
      if (!hub) {
        return { message: 'Hub not found.' };
      }
      return await this.dataSource.getRepository(Room).save(payload);
    }
  }

  //   Get All Rooms
  async getMyAllRooms(user: { id: string; role: UserRole }) {
    let identifier: string;
    if (user.role === UserRole.SERVICE_PROVIDER) {
      const hub = await this.dataSource
        .getRepository(Hub)
        .findOne({ where: { user_id: user.id } });
      identifier = hub.id;
    } else {
      identifier = user.id;
    }
    const data = await this.dataSource
      .getRepository(Room)
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.hub', 'hub')
      .leftJoinAndSelect('room.customer', 'customer')
      .where('room.hub_id = :identifier', { identifier })
      .orWhere('room.customer_id = :identifier', { identifier })
      .select([
        'room.id',
        'room.hub_id',
        'room.customer_id',
        'hub.name',
        'hub.avatar',
        'customer.full_name',
        'customer.avatar',
      ])
      .getRawMany();

    // get last message of each room
    const rooms = await Promise.all(
      data.map(async (room) => {
        const lastMessage = await this.dataSource
          .getRepository(Chat)
          .createQueryBuilder('chat')
          .where('chat.room_id = :room_id', { room_id: room.room_id })
          .orderBy('chat.created_at', 'DESC')
          .getOne();

        return {
          ...room,
          chat_text: lastMessage ? lastMessage.text : null,
          text_created_at: lastMessage ? lastMessage.created_at : null,
        };
      }),
    );

    return rooms;
  }

  //   Get Room by Room id
  async getRoom(user: { id: string; role: UserRole }, room_id: string) {
    let identifier: string;
    if (user.role === UserRole.SERVICE_PROVIDER) {
      const hub = await this.dataSource
        .getRepository(Hub)
        .findOne({ where: { user_id: user.id } });
      identifier = hub.id;
    } else {
      identifier = user.id;
    }
    const room = await this.dataSource
      .getRepository(Room)
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.hub', 'hub')
      .leftJoinAndSelect('room.customer', 'customer')
      .where('room.id = :room_id', { room_id })
      .where('room.hub_id = :identifier', { identifier })
      .orWhere('room.customer_id = :identifier', { identifier })
      .select([
        'room.id',
        'room.hub_id',
        'room.customer_id',
        'hub.name',
        'hub.avatar',
        'customer.full_name',
        'customer.avatar',
      ])
      .getOne();

    if (!room) {
      return { message: 'Room not found.' };
    }

    return {
      hub_id: room.hub_id,
      customer_id: room.customer_id,
      hubName: room.hub.name,
      hubAvatar: BASE_URL.backend + room.hub.avatar,
      customerFullName: room.customer.full_name,
      customerAvatar: room.customer.avatar,
    };
  }

  //   Delete Room By Customer
  async deleteRoom(user: User, room_id: string) {
    const room = await this.dataSource
      .getRepository(Room)
      .findOne({ where: { id: room_id } });
    if (!room) {
      return { message: 'Room not found.' };
    }
    if (user.role !== UserRole.CUSTOMER) {
      return { message: 'You are not authorized to delete this room.' };
    }

    if (user.id !== room.customer_id) {
      return { message: 'You are not authorized to delete this room.' };
    }
    await this.dataSource.getRepository(Room).delete({ id: room_id });

    return { message: 'Room deleted successfully.' };
  }

  // Send file message
  async sendFileMessage(
    user: User,
    file: Express.Multer.File,
    payload: CreateFileAndChatDto,
  ) {
    const room = await this.dataSource
      .getRepository(Room)
      .findOne({ where: { id: payload.room_id }, relations: { hub: true } });

    if (!room) throw new BadRequestException('Room Not Found.');
    if (!file) throw new BadRequestException('Image required.');
    payload.image = '/' + file.path;

    let chatPayload = {};

    payload.text
      ? (chatPayload = {
          text: payload.text,
          image: payload.image,
          room_id: payload.room_id,
          sender_id: user.id,
        })
      : (chatPayload = {
          image: payload.image,
          room_id: payload.room_id,
          sender_id: user.id,
        });
    const chat = await this.dataSource.getRepository(Chat).save(chatPayload);

    const data = await this.dataSource.getRepository(Chat).findOne({
      where: {
        id: chat.id,
      },
      relations: ['sender'],
      select: ['id', 'text', 'image', 'room_id', 'sender', 'created_at'],
    });

    const chat_row = {
      id: data.id,
      text: data.text,
      created_at: data.created_at,
      room_id: data.room_id,
      sender: {
        id: data.sender_id,
        role: data.sender.role,
        full_name: data.sender.full_name,
      },
      avatar: data.sender.avatar,
    };

    if (user.role === UserRole.SERVICE_PROVIDER) {
      const hub = await this.dataSource.getRepository(Hub).findOne({
        where: { user_id: user.id },
        select: ['name', 'avatar'],
      });
      chat_row.sender.full_name = hub.name;
      chat_row.avatar = hub.avatar;
    }

    // prepare for socket
    // prepare for notification

    return chat_row;
  }

  // Send Message
  async sendMessage(
    user: { user_id: string; role: UserRole },
    payload: CreateChatDto,
  ) {
    const room = await this.dataSource
      .getRepository(Room)
      .findOne({ where: { id: payload.room_id }, relations: { hub: true } });

    if (!room) throw new BadRequestException('Room Not Found.');

    // save chat on database
    const chat = await this.dataSource.getRepository(Chat).save({
      text: payload.text,
      room_id: payload.room_id,
      sender_id: user.user_id,
    });

    const data = await this.dataSource.getRepository(Chat).findOne({
      where: { id: chat.id },
      relations: ['sender'],
      select: ['id', 'text', 'image', 'room_id', 'sender', 'created_at'],
    });

    const chat_row = {
      id: data.id,
      text: data.text,
      created_at: data.created_at,
      room_id: data.room_id,
      sender: {
        id: data.sender.id,
        role: data.sender.role,
        full_name: data.sender.full_name,
      },
      avatar: data.sender.avatar,
    };

    if (user.role === UserRole.SERVICE_PROVIDER) {
      const hub = await this.dataSource.getRepository(Hub).findOne({
        where: { user_id: user.user_id },
        select: ['name', 'avatar'],
      });
      chat_row.sender.full_name = hub.name;
      chat_row.avatar = hub.avatar ? BASE_URL.backend + hub.avatar : null;
    }

    // Fetching receiver user id from the room
    let receiverUserId;

    // Check if the sender is a customer or a service provider
    if (user.role === UserRole.CUSTOMER) {
      // If the sender is a customer, set the receiver as the seller
      receiverUserId = room.hub.user_id;
    } else if (user.role === UserRole.SERVICE_PROVIDER) {
      // If the sender is a service provider, set the receiver as the customer
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      receiverUserId = room.customer_id;
    }

    // prepare for notification
    // save notification

    return chat_row;
  }

  // delete a chat
  async deleteChat(user: { id: string; role: UserRole }, chat_id: string) {
    const chat = await this.dataSource.getRepository(Chat).findOne({
      where: { id: chat_id },
      relations: { sender: true },
    });
    if (!chat) throw new BadRequestException('Message not found.');

    if (chat.sender_id !== user.id) {
      return { message: 'You are not authorized.' };
    }

    await this.dataSource.getRepository(Chat).delete({ id: chat_id });

    // prepare for notification
    return {
      message: 'Message deleted successfully.',
      room_id: chat.room_id,
    };
  }

  // Get All Chats
  async getAllMessages(user: { id: string; role: UserRole }, room_id: string) {
    //Check if room exists
    const room = await this.dataSource
      .getRepository(Room)
      .findOne({ where: { id: room_id } });
    if (!room) {
      return { message: 'Room not found.' };
    }

    //Check if user is authorized
    if (user.role === UserRole.SERVICE_PROVIDER) {
      const hub = await this.dataSource
        .getRepository(Hub)
        .findOne({ where: { user_id: user.id } });
      if (hub.id !== room.hub_id) {
        throw new BadRequestException('You are not authorized.');
      }
    } else {
      if (user.id !== room.customer_id) {
        throw new BadRequestException('You are not authorized.');
      }
    }

    const chats = await this.dataSource.getRepository(Chat).find({
      where: { room_id },
      relations: ['sender', 'sender.hub'],
      select: {
        id: true,
        text: true,
        created_at: true,
        image: true,
        sender_id: true,
        room_id: true,
        sender: {
          role: true,
          full_name: true,
          avatar: true,
          hub: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    const response = chats;

    // message for socket
    const dataMessage = response.map((res) => {
      const avatar =
        res.sender.role === UserRole.SERVICE_PROVIDER
          ? res.sender.hub.avatar
          : res.sender.avatar;
      const senderName =
        res.sender.role === UserRole.SERVICE_PROVIDER
          ? res.sender.hub.name
          : res.sender.full_name;
      return {
        id: res.id,
        text: res.text,
        created_at: res.created_at,
        sender: {
          id: res.sender_id,
          role: res.sender.role,
        },
        room_id: res.room_id,
        senderName,
        avatar,
      };
    });

    return dataMessage;
  }
}
