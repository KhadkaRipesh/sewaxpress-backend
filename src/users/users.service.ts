import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { DataSource } from 'typeorm';
import { paginateResponse } from 'src/@helpers/pagination';
import { UpdateUserDTO, UserFilterDTO } from './dto/user.dto';
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

  // Update user profile
  async updateCurrentUser(user: User, payload: UpdateUserDTO) {
    const existing_user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: user.id } });

    existing_user.address = payload.address;
    existing_user.full_name = payload.full_name;
    existing_user.phone_number = payload.phone_number;
    if (payload.avatar) {
      existing_user.avatar = payload.avatar;
    }

    const updatedUser = await this.dataSource
      .getRepository(User)
      .save(existing_user);

    return updatedUser;
  }
}
