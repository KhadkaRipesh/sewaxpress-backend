import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export enum GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}
export class CreateCustomerDTO {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Matches(/^[a-zA-Z ]*$/, {
    message: 'Full name must contain only letters and space',
  })
  full_name: string;

  @ApiPropertyOptional({ example: '+9779810203048' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiProperty({
    type: 'enum',
    enum: [UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER, UserRole.ADMIN],
    example: UserRole.CUSTOMER,
  })
  @IsEnum([UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER])
  @IsIn([UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER])
  @IsOptional()
  role: UserRole;
}

export class LoginUserDTO {
  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

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
}

export class PasswordCreationDTO {
  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  re_password: string;
}

export class ResendEmailVerificationCodeDTO {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class ResetPasswordRequestDTO {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

export class ResetPasswordDto extends PasswordCreationDTO {}

export class CreateServiceProviderDTO {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  @Matches(/^[a-zA-Z ]*$/, {
    message: 'Full name must contain only letters and space',
  })
  full_name: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
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

  @ApiPropertyOptional({
    type: 'array',
    format: 'binary',
    example: 'example.jpg',
  })
  cerificate_or_experience: any;

  @ApiProperty()
  @IsString()
  license_no: string;

  @ApiProperty({ example: 'MM/DD/YYY' })
  @IsString()
  @IsNotEmpty()
  issued_date: string;

  @ApiProperty({ example: 'MM/DD/YYY' })
  @IsString()
  @IsNotEmpty()
  expiry_date: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_back: any;
}
