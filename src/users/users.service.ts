import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { DataSource } from 'typeorm';
import { paginateResponse } from 'src/@helpers/pagination';
import { UpdateUserDTO, UserFilterDTO } from './dto/user.dto';
import { User } from './entities/user.entity';
import * as fs from 'fs';

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
  async updateCurrentUser(
    user: User,
    payload: UpdateUserDTO,
    file?: Express.Multer.File,
  ) {
    const existing_user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: user.id } });

    if (payload.avatar) {
      payload.avatar = null;
    }

    if (file) {
      payload.avatar = '/' + file.path;
      if (user.avatar) {
        const path = user.avatar.slice(1);
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }
    }

    existing_user.address = payload.address;
    existing_user.avatar = payload.avatar;
    existing_user.full_name = payload.full_name;
    existing_user.phone_number = payload.phone_number;

    const updatedUser = await this.dataSource
      .getRepository(User)
      .save(existing_user);

    return updatedUser;
  }
}
