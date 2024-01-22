import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export enum BookStatus {
  bookingPlaced = 'BOOKING_PLACED',
  bookingProcessing = 'BOOKING_PROCESSING',
  bookingCompleted = 'BOOKING_COMPLETED',
  bookingCancelled = 'BOOKING_CANCELLED',
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
