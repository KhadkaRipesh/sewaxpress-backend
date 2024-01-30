import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Notification Title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Notification Content' })
  @IsString()
  body: string;

  @ApiProperty({
    type: 'enum',
    example: 'BOOK',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty({ example: 'user id uuid here' })
  @IsUUID()
  user_id: string;
}
