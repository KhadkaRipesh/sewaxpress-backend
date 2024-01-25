import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: 'Type a message..' })
  @IsString()
  text: string;

  @ApiProperty({ example: 'uuid here' })
  @IsUUID()
  room_id: string;
}
export class CreateFileAndChatDto {
  @ApiPropertyOptional({ example: 'Type a message....' })
  @IsOptional()
  @IsString()
  text: string;

  @ApiProperty({ format: 'binary', example: 'example.jpg' })
  image: any;

  @ApiProperty({ example: 'uuid here' })
  @IsUUID()
  room_id: string;
}
