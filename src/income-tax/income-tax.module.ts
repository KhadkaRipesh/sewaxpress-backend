import { Module } from '@nestjs/common';
import { IncomeTaxController } from './income-tax.controller';
import { IncomeTaxService } from './income-tax.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeAndTax } from './entities/income-tax.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeAndTax])],
  controllers: [IncomeTaxController],
  providers: [IncomeTaxService],
})
export class IncomeTaxModule {}
