import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { DataSource } from 'typeorm';
import { paginateResponse } from 'src/@helpers/pagination';
import { UserFilterDTO } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  //   to get all customers from admin

  async getAllUsers(query: PaginationDto, filter: UserFilterDTO) {
    const skip = (query.page - 1) * query.limit;
    const queryBuilder = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user');

    //   if user enters the role to filter
    if (filter.role) {
      queryBuilder.where('user.role =:role', { role: filter.role });
    }
    const users = await queryBuilder
      .take(query.limit)
      .skip(skip)
      .getManyAndCount();

    return paginateResponse(users, query.page, query.limit);
  }
}
