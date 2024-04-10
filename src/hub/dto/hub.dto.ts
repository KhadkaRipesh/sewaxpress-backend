import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBooleanString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum HubStatus {
  PENDING = 'PENDING', // when hub is created by service provider
  ACTIVE = 'ACTIVE', // when hub is approved by admin
  CLOSED = 'CLOSED', // when hub is closed by admin
  SUSPENDED = 'SUSPENDED', // when hub is temporarily suspended by admin
}
export class CreateHubDto {
  @ApiProperty({ example: 'Ripeshs Tech' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Lalitpur' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: ' ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  avatar: any;

  @IsArray()
  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsOptional()
  documents?: any[];

  // service provider details
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z ]*$/, {
    message: 'Full name must contain only letters and space',
  })
  full_name: string;

  @ApiProperty({ example: '+9779861595869' })
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_back: any;
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

export class UpdateHubByAdminDto {
  @ApiPropertyOptional({
    type: 'enum',
    example: HubStatus.PENDING,
    enum: HubStatus,
  })
  @IsEnum(HubStatus)
  @IsOptional()
  status: HubStatus;
}
