import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class BookVerificationDto {
  @ApiProperty({ example: '58627' })
  @IsString()
  @MaxLength(5)
  @MinLength(5)
  code: string;
}
