import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceDto } from './dto/service.dto';
import { Hub } from 'src/hub/entities/hub.entity';
import { Category } from './entities/category.entity';
import { Service } from './entities/service.entity';
import { BASE_URL } from 'src/@config/constants.config';

@Injectable()
export class ServiceService {
  constructor(private readonly dataSource: DataSource) {}

  //   Create a new Service
  async createService(user_id: string, payload: CreateServiceDto) {
    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { id: payload.hub_id, user_id: user_id } });

    if (!hub)
      throw new BadRequestException(
        'Service Provider doesnot belong to the hub',
      );

    const category = await this.dataSource
      .getRepository(Category)
      .findOne({ where: { id: payload.category_id } });

    if (!category) throw new BadRequestException('Category Doesnot Exists.');

    const service = await this.dataSource
      .getRepository(Service)
      .save({ hub_id: hub.id, ...payload });
    service.image = BASE_URL.backend + service.image;

    return service;
  }
}
