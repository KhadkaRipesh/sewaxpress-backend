import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export interface IPage {
  page?: number;
  limit?: number;
}

export class DeleteAChatPayload {
  @ApiProperty({ example: '65c65c8b-c469-49e2-af7b-d0c113c2f386' })
  @IsUUID()
  chat_id: string;
}
export class GetAllChatPayload {
  @ApiProperty({ example: '65c65c8b-c469-49e2-af7b-d0c113c2f386' })
  @IsUUID()
  room_id: string;

  @ApiProperty({ example: { page: 2, limit: 5 } })
  @IsOptional()
  options: IPage;
}

export class GetARoomPayload {
  @ApiProperty({ example: '65c65c8b-c469-49e2-af7b-d0c113c2f386' })
  @IsUUID()
  room_id: string;
}
