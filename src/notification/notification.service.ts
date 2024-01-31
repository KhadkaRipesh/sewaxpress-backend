import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { paginateResponse } from 'src/@helpers/pagination';

@Injectable()
export class NotificationService {
  constructor(private readonly dataSource: DataSource) {}

  //   Get All Notificaion of Specific User
  async getMyAllNotification(user_id: string, query?: PaginationDto) {
    const take = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * take;

    const data = await this.dataSource
      .getRepository(Notification)
      .findAndCount({
        where: { user_id },
        order: { created_at: 'DESC' },
        take,
        skip,
      });

    return paginateResponse(data, page, take);
  }

  //   Get All Unread Notifcation of Specific User
  async getUnreadNotifications(user_id: string, query?: PaginationDto) {
    const take = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * take;

    const data = await this.dataSource
      .getRepository(Notification)
      .findAndCount({
        where: { user_id, read: false },
        order: { created_at: 'DESC' },
        take,
        skip,
      });

    return paginateResponse(data, page, take);
  }

  //   Get all unread notification count
  async getUnreadNotificationsCount(user_id: string) {
    const count = await this.dataSource
      .getRepository(Notification)
      .count({ where: { user_id, read: false } });
    return { count };
  }

  //   Mark notification as read
  async markAllNotificationsRead(user_id: string) {
    await this.dataSource
      .getRepository(Notification)
      .update({ user_id, read: false }, { read: true });

    return { message: 'All notifications marked as read' };
  }

  //   Delete notification
  async deleteNotification(user_id: string, id: string) {
    //Check if notification exists
    const notification = await this.dataSource
      .getRepository(Notification)
      .findOne({ where: { id, user_id } });

    if (!notification) throw new BadRequestException('Notification not found');

    //delete notification
    await this.dataSource.getRepository(Notification).delete(id);

    return { message: 'Notification deleted successfully' };
  }
}
