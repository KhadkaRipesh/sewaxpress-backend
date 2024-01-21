import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateIncomeTaxDto, UpdateIncomeTaxDto } from './dto/income-tax.dto';
import { IncomeAndTax } from './entities/income-tax.entity';

@Injectable()
export class IncomeTaxService {
  constructor(private readonly dataSource: DataSource) {}

  async createIncomeAndTax(payload: CreateIncomeTaxDto) {
    const isIncomeAndTax = await this.dataSource
      .getRepository(IncomeAndTax)
      .find();

    if (isIncomeAndTax.length > 0)
      throw new BadRequestException('Income and tax detail already exists.');
    await this.dataSource.getRepository(IncomeAndTax).save(payload);

    return isIncomeAndTax;
  }

  async updateIncomeAndTax(id: string, payload: UpdateIncomeTaxDto) {
    const isIncomeAndTax = await this.dataSource
      .getRepository(IncomeAndTax)
      .findOne({ where: { id } });
    if (!isIncomeAndTax) throw new BadRequestException('Invalid uuid.');

    await this.dataSource
      .getRepository(IncomeAndTax)
      .save({ id: id, ...payload });

    return isIncomeAndTax;
  }

  async getIncomeAndTax() {
    return await this.dataSource.getRepository(IncomeAndTax).find();
  }
}
