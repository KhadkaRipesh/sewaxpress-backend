import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/@helpers/pagination.dto';

export enum BookStatus {
  bookingPlaced = 'BOOKING_PLACED',
  bookingProcessing = 'BOOKING_PROCESSING',
  bookingCompleted = 'BOOKING_COMPLETED',
  bookingCancelled = 'BOOKING_CANCELLED',
}
export enum FilterByDateType {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  CUSTOM = 'custom',
}

export class CreateServiceBookDto {
  @ApiProperty({ example: '2023-07-20' })
  @IsDateString()
  booking_date: Date;

  @ApiProperty({ example: 'Kathmandu' })
  @IsString()
  @IsNotEmpty()
  booking_address: string;
}

export class BookingFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    type: 'enum',
    example: 'BOOKING-PROCESSING',
    enum: BookStatus,
  })
  @IsEnum(BookStatus)
  @IsOptional()
  book_status: BookStatus;

  @ApiPropertyOptional({
    type: 'enum',
    example: FilterByDateType.YESTERDAY,
    enum: FilterByDateType,
  })
  @IsEnum(FilterByDateType)
  @IsOptional()
  date: FilterByDateType;

  @ApiPropertyOptional({ example: '2023-02-24' })
  @IsDateString()
  @IsOptional()
  start_date: string;

  @ApiPropertyOptional({ example: '2023-02-24' })
  @IsDateString()
  @IsOptional()
  end_date: string;
}
