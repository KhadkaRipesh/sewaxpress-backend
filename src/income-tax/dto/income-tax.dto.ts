import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateIncomeTaxDto {
  @ApiProperty({ example: 50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  vendor_commission: number;

  @ApiProperty({ example: 50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  tax: number;
}

export class UpdateIncomeTaxDto extends CreateIncomeTaxDto {}
