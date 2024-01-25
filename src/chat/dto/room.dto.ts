import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'uuid here' })
  @IsUUID()
  hub_id: string;

  @ApiProperty({ example: 'uuid here' })
  @IsUUID()
  customer_id: string;
}
