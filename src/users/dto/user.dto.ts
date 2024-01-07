import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { IsEnum, IsOptional } from 'class-validator';

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
