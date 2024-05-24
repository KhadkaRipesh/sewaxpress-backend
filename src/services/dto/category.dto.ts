import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDTO {
  @ApiPropertyOptional({ example: 'Home Alliance' })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  category_name: string;

  @ApiProperty({ format: 'binary', example: 'example.jpg' })
  image: string;
}

export class UpdateCategoryDTO extends CreateCategoryDTO {}
