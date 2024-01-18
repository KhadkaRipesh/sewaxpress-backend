import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HubRating } from '../entities/hub-review.entity';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateHubReviewDto {
  @ApiProperty({ type: 'enum', example: HubRating.Five })
  @IsEnum(HubRating)
  @IsIn([
    HubRating.One,
    HubRating.Two,
    HubRating.Three,
    HubRating.Four,
    HubRating.Five,
  ])
  rating: HubRating;

  @ApiPropertyOptional({ example: 'This hub provides great services.' })
  @IsString()
  @IsOptional()
  comment: string;
}
