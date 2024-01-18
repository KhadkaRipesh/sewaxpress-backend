import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBooleanString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HubTimingDto } from './hub-days.dto';
import { Transform, Type } from 'class-transformer';

export enum HubStatus {
  PENDING = 'PENDING', // when hub is created by service provider
  ACTIVE = 'ACTIVE', // when hub is approved by admin
  CLOSED = 'CLOSED', // when hub is closed by admin
  SUSPENDED = 'SUSPENDED', // when hub is temporarily suspended by admin
}
export class CreateHubDto {
  @ApiProperty({ example: 'Ripeshs Tech' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+9779861595869' })
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ example: ' ' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  avatar: any;

  @ApiProperty({ example: 'Lalitpur' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '654654' })
  @IsNotEmpty()
  @IsString()
  abn_acn_number: string;

  @IsArray()
  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsOptional()
  documents?: any[];

  @ApiPropertyOptional({
    example: {
      sunday: {
        open: '8am',
        close: '6pm',
      },
      monday: {
        open: '8am',
        close: '6pm',
      },
      tuesday: {
        open: '8am',
        close: '6pm',
      },
      wednesday: {
        open: '8am',
        close: '6pm',
      },
      thursday: {
        open: '8am',
        close: '6pm',
      },
      friday: {
        open: '8am',
        close: '6pm',
      },
      saturday: {
        open: '8am',
        close: '6pm',
      },
    },
  })
  @ValidateNested()
  @Type(() => HubTimingDto)
  @IsOptional()
  opening_hours?: HubTimingDto;
}
export class GetHubByStatusDto {
  @ApiPropertyOptional({
    type: 'enum',
    example: HubStatus.PENDING,
    enum: HubStatus,
  })
  @IsEnum(HubStatus)
  @IsOptional()
  status: HubStatus;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}

export class UpdateHubDto extends CreateHubDto {
  @ApiPropertyOptional({
    type: 'enum',
    example: HubStatus.PENDING,
    enum: HubStatus,
  })
  @IsEnum(HubStatus)
  @IsOptional()
  status: HubStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBooleanString()
  is_verified: boolean;
}
