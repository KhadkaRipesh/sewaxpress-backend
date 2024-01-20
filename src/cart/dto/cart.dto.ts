import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddServiceToCartDto {
  @ApiProperty({ example: '72ccc1a2-5603-40cd-b2f2-9c5f18cc2tsh' })
  @IsUUID()
  service_id: string;

  @ApiPropertyOptional({ example: 'Any concerns to share..' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note: string;

  @ApiProperty({ example: '18ccc1a2-5603-40cd-b2f2-9c5f18cc8eec' })
  @IsUUID()
  hub_id: string;
}

export class UpdateCartDto {
  @ApiPropertyOptional({ example: 'Kirtipur, Kathmandu' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  booking_address: string;
}
