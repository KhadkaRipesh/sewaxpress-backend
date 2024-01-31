import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get My Notifications',
    description: 'UserRole.All',
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Notification')
  @UseGuards(JwtAuthGuard)
  getAllNotification(
    @GetUser('id') user_id: string,
    @Query() query: PaginationDto,
  ) {
    console.log(user_id, query);
  }

  @Get('unread')
  @ApiOperation({
    summary: 'Get My Unread Notifications',
    description: 'UserRole.All',
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Unread Notification')
  @UseGuards(JwtAuthGuard)
  getUnReadNotification(
    @GetUser('id') user_id: string,
    @Query() query: PaginationDto,
  ) {
    console.log(user_id, query);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get My Unread Notifications Count',
    description: 'UserRole.All',
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Unread Notification Count')
  @UseGuards(JwtAuthGuard)
  getUnReadCount(@GetUser('id') user_id: string) {
    console.log(user_id);
  }

  @Patch('mark-all-read')
  @ApiOperation({
    summary: 'Mark as Read notification',
    description: 'UserRole.All',
  })
  @ResponseMessage(SuccessMessage.UPDATE, 'Notifications')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@GetUser('id') user_id: string) {
    console.log(user_id);
  }

  @Delete(':id')
  @ResponseMessage(SuccessMessage.DELETE, 'Notifications')
  @ApiOperation({ summary: 'Delete Notification', description: 'UserRole.All' })
  @UseGuards(JwtAuthGuard)
  deleteNotification(
    @GetUser('id') user_id: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    console.log(user_id, id);
  }
}
