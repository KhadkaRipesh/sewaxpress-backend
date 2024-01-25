import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { CreateRoomDto } from './dto/room.dto';
import { Room } from './entities/room.entity';
import { Hub } from 'src/hub/entities/hub.entity';
import { Chat } from './entities/chat.entity';
import { BASE_URL } from 'src/@config/constants.config';

@Injectable()
export class ChatService {
  constructor(private readonly dataSource: DataSource) {}

  async createRoom(user: User, payload: CreateRoomDto) {
    if (user.id !== payload.customer_id)
      throw new UnauthorizedException('You are not authorized.');

    const existingRoom = await this.dataSource.getRepository(Room).findOne({
      where: { customer_id: payload.customer_id, hub_id: payload.hub_id },
    });

    if (existingRoom) {
      return {
        message: 'A room already exists between this customer and seller.',
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
  async getMyAllRooms(user: User) {
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
  async getRoom(user: User, room_id: string) {
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
      .where('room.id -:room_id', { room_id })
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
      shop_id: room.hub_id,
      customer_id: room.customer_id,
      shopName: room.hub.name,
      shopAvatar: BASE_URL.backend + room.hub.avatar,
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
}
