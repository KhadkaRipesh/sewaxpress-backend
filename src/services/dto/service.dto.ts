import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Laptop Repair' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ format: 'binary', example: 'example.jpg' })
  image: string;

  @ApiProperty({ example: 'Hardware of laptop will be repair from here.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: '30min' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  estimated_time: string;

  @ApiPropertyOptional({ example: true })
  @IsBooleanString()
  @IsOptional()
  is_available: boolean;

  @ApiProperty({ example: '4c700ef9-29f0-49da-8e3f-b67bc331868c' })
  @IsUUID()
  category_id: string;
}

export class SearchPayloadDto {
  @ApiProperty({ example: 'any service' })
  @IsString()
  @IsNotEmpty()
  service_name: string;
}
