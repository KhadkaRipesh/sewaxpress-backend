import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, IsNull, Not } from 'typeorm';
import { CreateServiceDto, SearchPayloadDto } from './dto/service.dto';
import { Hub } from 'src/hub/entities/hub.entity';
import { Category } from './entities/category.entity';
import { Service } from './entities/service.entity';
import { BASE_URL } from 'src/@config/constants.config';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { paginateResponse } from 'src/@helpers/pagination';
import * as fs from 'fs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ServiceService {
  constructor(private readonly dataSource: DataSource) {}

  //   Create a new Service
  async createService(user_id: string, payload: CreateServiceDto) {
    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { user_id: user_id } });

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
  async getAllService(location: string, category: string) {
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
        'hub.id',
        'hub.name',
        'hub.address',
        'category.category_name',
      ]);

    //   can add review of the service or hub too
    const rawData = await query.getMany();

    return rawData;
  }

  async getMyService(user_id: string) {
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
        'hub.id',
        'hub.name',
        'hub.address',
        'category.category_name',
        'category.id',
      ])
      .getMany();

    const finalData = await data;
    return finalData;
  }

  // To update Service

  async updateService(
    user_id: string,
    service_id: string,
    payload: CreateServiceDto,
    file: Express.Multer.File,
  ) {
    const service = await this.dataSource.getRepository(Service).findOne({
      where: {
        id: service_id,
        hub: { user_id: user_id },
      },
    });
    if (!service)
      throw new BadRequestException('Service doesnot belog to the hub.');

    if (file) {
      payload.image = '/' + file.path;
      if (service.image) {
        const path = service.image.slice(1);
        fs.unlinkSync(path);
      }
    }

    const updated_service = await this.dataSource
      .getRepository(Service)
      .save({ id: service_id, ...payload });

    return updated_service;
  }

  // Get service by id
  async getServiceById(service_id: string) {
    const query = this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .where('service.id =:service_id', { service_id })
      .andWhere('service.is_available = true')
      .select([
        'service.id',
        'service.name',
        'service.image',
        'service.description',
        'service.estimated_time',
        'service.price',
        'service.is_available',
        'service.category_id',
        'service.hub_id',
      ]);

    const rawData = await query.getRawOne();
    return rawData;
  }

  async getServiceByName(
    searchPayload: SearchPayloadDto,
    query: PaginationDto,
  ) {
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const sql = this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .leftJoin('service.hub', 'hub')
      .leftJoin('service.category', 'category')
      .where({ is_available: true })
      .andWhere('service.name ILIKE :service_name', {
        service_name: `%${searchPayload.service_name}%`,
      })
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
      .take(take);

    const rawData = await sql.getManyAndCount();

    return paginateResponse(rawData, page, take);
  }

  // Soft delete service

  async deleteService(service_id: string, user_id: string) {
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin('user.hub', 'hub')
      .leftJoin('hub.services', 'service')
      .where('service.id =:service_id', { service_id })
      .andWhere('user.id =:user_id', { user_id })
      .getOne();

    if (!user) throw new BadRequestException('You are not authorized');

    const toDelete = await this.dataSource
      .getRepository(Service)
      .softDelete(service_id);

    return toDelete;
  }

  // Get All deleted Service
  async getAllDeletedServices(user_id: string, query: PaginationDto) {
    const take = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const deletedService = await this.dataSource
      .getRepository(Service)
      .findAndCount({
        where: {
          hub: {
            user_id,
          },
          deleted_at: Not(IsNull()),
        },
        withDeleted: true,
        relations: ['category', 'hub'],
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          price: true,
          is_available: true,
          hub: { id: true, name: true },
          category: { id: true, category_name: true },
        },
        take,
        skip,
      });

    return paginateResponse(deletedService, page, take);
  }

  // Recover deleted Service
  async recoverService(service_id: string, user_id: string) {
    const service = await this.dataSource.getRepository(Service).findOne({
      where: { id: service_id, hub: { user_id }, deleted_at: Not(IsNull()) },
      withDeleted: true,
    });
    if (!service) throw new BadRequestException('Service not found on trash.');

    return await this.dataSource.getRepository(Service).restore(service_id);
  }

  // Permanent delete Servic
  async deleteServicePermanently(service_id: string, user_id: string) {
    const isValidUser = await this.dataSource.getRepository(Service).findOne({
      where: { id: service_id, deleted_at: Not(IsNull()), hub: { user_id } },
      withDeleted: true,
    });
    if (!isValidUser) throw new BadRequestException('No such Service on Trash');

    return await this.dataSource.getRepository(Service).delete(service_id);
  }
}
