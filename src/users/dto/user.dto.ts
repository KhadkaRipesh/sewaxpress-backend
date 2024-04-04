import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UserFilterDTO {
  @ApiPropertyOptional({
    type: 'enum',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole, { each: true })
  role: UserRole;
}
export class UpdateUserDTO {
  @ApiPropertyOptional({ format: 'binary', example: 'user.jpg' })
  @IsOptional()
  avatar: any;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z ]*$/, {
    message: 'Full name must contain only letters and space',
  })
  full_name: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: '+9779861583920' })
  phone_number: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Kathmandu' })
  address: string;
}
