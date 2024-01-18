import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class HubStatusDto {
  @IsString()
  @IsNotEmpty()
  open: string;

  @IsString()
  @IsNotEmpty()
  close: string;
}

export class HubTimingDto {
  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  sunday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  monday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  tuesday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  wednesday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  thursday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  friday?: HubStatusDto[];

  @IsArray()
  @ValidateNested()
  @IsOptional()
  @Type(() => HubStatusDto)
  saturday?: HubStatusDto[];
}
