import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceDto } from './dto/service.dto';
import { Hub } from 'src/hub/entities/hub.entity';
import { Category } from './entities/category.entity';
import { Service } from './entities/service.entity';
import { BASE_URL } from 'src/@config/constants.config';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { paginateResponse } from 'src/@helpers/pagination';

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

  //   Get All Services from address
  async getAllService(
    location: string,
    category: string,
    pagination: PaginationDto,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query = this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .leftJoin('service.hub', 'hub')
      .leftJoin('service.category', 'category')
      .where('hub.address = :location', { location })
      .andWhere('category.id =:category', { category })
      .select([
        'service.id',
        'service.name',
        'service.description',
        'service.estimated_time',
        'service.price',
        'service.is_available',
        'service.image',
        'hub.name',
        'hub.address',
        'category.category_name',
      ])
      .take(pagination.limit)
      .skip(skip);

    //   can add review of the service or hub too
    const rawData = await query.getManyAndCount();

    return paginateResponse(rawData, pagination.page, pagination.limit);
  }

  async getMyService(user_id: string, query: PaginationDto) {
    const skip = (query.page - 1) * query.limit;
    const data = this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .leftJoin('service.hub', 'hub')
      .leftJoin('service.category', 'category')
      .leftJoin('hub.user', 'user')
      .where('user.id =:user_id', { user_id })
      .select([
        'service.id',
        'service.name',
        'service.description',
        'service.estimated_time',
        'service.price',
        'service.is_available',
        'service.image',
        'hub.name',
        'hub.address',
        'category.category_name',
      ])
      .skip(skip)
      .take(query.limit)
      .getManyAndCount();

    const finalData = await data;

    return paginateResponse(finalData, query.page, query.limit);
  }
}
