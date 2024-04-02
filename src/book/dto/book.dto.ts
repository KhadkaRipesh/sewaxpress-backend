import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum BookStatus {
  bookingPlaced = 'BOOKING_PLACED',
  bookingProcessing = 'BOOKING_PROCESSING',
  bookingCompleted = 'BOOKING_COMPLETED',
  bookingCancelled = 'BOOKING_CANCELLED',
  readyForService = 'READYFORSERVICE',
}
export enum FilterByDateType {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
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

export class BookingFilterDto {
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

export class ChangeBookStatus {
  @ApiProperty({ type: 'enum', example: BookStatus.bookingPlaced })
  @IsIn([
    BookStatus.bookingCancelled,
    BookStatus.bookingProcessing,
    BookStatus.readyForService,
  ])
  book_status: BookStatus;

  @ApiPropertyOptional({ example: 'Un availability' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cancelled_reason: string;
}

export class CancelBooking {
  @ApiPropertyOptional({ example: 'Un availability' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cancelled_reason: string;
}
