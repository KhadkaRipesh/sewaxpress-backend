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

export class ChangePasswordDto {
  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  current_password: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;

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
