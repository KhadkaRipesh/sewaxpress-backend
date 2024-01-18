import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreateHubDto,
  GetHubByStatusDto,
  HubStatus,
  UpdateHubDto,
} from './dto/hub.dto';
import { Hub } from './entities/hub.entity';
import { BASE_URL } from 'src/@config/constants.config';
import { paginateResponse } from 'src/@helpers/pagination';
import { User, UserRole } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import { CreateHubReviewDto } from './dto/hub-review.dto';
import { HubReview } from './entities/hub-review.entity';
import { PaginationDto } from 'src/@helpers/pagination.dto';

@Injectable()
export class HubService {
  constructor(private readonly dataSource: DataSource) {}

  //   Register Hub

  async registerHub(
    user_id: string,
    payload: CreateHubDto,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!files['avatar']) throw new BadRequestException('Avatar is required');
      if (!files['documents'])
        throw new BadRequestException('Documents are required');

      payload.avatar = '/' + files['avatar'][0].path;

      payload.documents = [];
      files['documents'].forEach((document) => {
        payload.documents.push('/' + document.path);
      });

      //Check if user already has a shop
      const hubExist = await this.dataSource
        .getRepository(Hub)
        .findOne({ where: { user_id } });
      if (hubExist)
        throw new BadRequestException('User already have a service hub');

      const hub = await this.dataSource
        .getRepository(Hub)
        .save({ ...payload, user_id });
      hub.avatar = BASE_URL.backend + hub.avatar;
      hub.documents = hub.documents.map((path) => BASE_URL.backend + path);

      await queryRunner.commitTransaction();
      return hub;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(e.message);
    } finally {
      await queryRunner.release();
    }
  }

  //    Get All Shop By Admin
  async getAllHubsByStatus(query: GetHubByStatusDto) {
    const { status, page: pg, limit } = query;
    const take = limit || 10;
    const page = pg || 1;
    const skip = (page - 1) * take;

    const data = await this.dataSource.getRepository(Hub).findAndCount({
      where: { status },
      take,
      skip,
    });
    const hubs = paginateResponse(data, page, limit);
    return hubs;
  }

  //   Get own shop from here
  async getMyHub(user_id: string) {
    const data = await this.dataSource.getRepository(Hub).findOne({
      where: { user_id },
    });
    if (!data)
      throw new NotFoundException(
        'You do not have a service hub. Register First',
      );

    return data;
  }

  //   Get A hub
  async getHubById(hub_id: string) {
    const query = this.dataSource
      .getRepository(Hub)
      .createQueryBuilder('hub')
      .where('hub.id = :hub_id', { hub_id })
      .select([
        'hub.name as name',
        'hub.avatar as avatar',
        'hub.description as description',
        'hub.phone_number as phone_number',
        'hub.address as address',
        'hub.opening_hours as opening_hours',
      ])
      .addSelect(
        '(SELECT AVG(rating) as rating FROM hub_review WHERE "hub_id" = hub.id)',
        'avg_rating',
      )
      .addSelect(
        '(SELECT COUNT(rating) as rating FROM hub_review WHERE "hub_id" = hub.id)',
        'rating_count',
      );

    //   Retireve the raw data from database
    const rawData = await query.getRawOne();

    rawData.avg_rating = Number(parseFloat(rawData.avg_rating).toFixed(1));
    rawData.rating_count = Number(rawData.rating_count);

    return rawData;
  }

  async updateHub(
    user: User,
    hub_id: string,
    payload: UpdateHubDto,
    files: Express.Multer.File[],
  ) {
    const where = { id: hub_id };
    if (user.role === UserRole.SERVICE_PROVIDER) {
      Object.assign(where, { user_id: user.id });

      if (payload.is_verified)
        throw new BadRequestException('Only admin can verify a hub.');

      if (payload.status)
        throw new BadRequestException(
          'Only admin can change the status of hub.',
        );
    }
    const hub = await this.dataSource.getRepository(Hub).findOne({ where });
    if (!hub) throw new BadRequestException('User doenot belongs to the hub.');

    if (payload.avatar) {
      payload.avatar = null;
    }
    if (files) {
      if (files['avatar']) {
        payload.avatar = '/' + files['avatar'][0].path;
        // Delete old path

        const path = hub.avatar.slice(1);
        fs.unlinkSync(path);
      }
    }

    if (payload.opening_hours) {
      payload['opening_hours'] = {
        ...hub.opening_hours,
        ...payload.opening_hours,
      };
    }

    Object.assign(hub, payload);

    const updatedHub = await this.dataSource.getRepository(Hub).save({
      ...hub,
      status: user.role === UserRole.ADMIN ? hub.status : HubStatus.PENDING,
      ...payload,
    });
    updatedHub.avatar = BASE_URL.backend + updatedHub.avatar;
    hub.documents = hub.documents.map((path) => BASE_URL.backend + path);

    return updatedHub;
  }

  //   For reviewing the hub
  async reviewHub(
    user_id: string,
    hub_id: string,
    payload: CreateHubReviewDto,
  ) {
    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { id: hub_id } });
    if (!hub) throw new NotFoundException('Hub not found.');

    const review = await this.dataSource
      .getRepository(HubReview)
      .findOne({ where: { hub_id: hub_id } });
    //   if review exist update review else create new one
    if (review) {
      review.rating = payload.rating;
      review.comment = payload.comment;

      await this.dataSource.getRepository(HubReview).save(review);
      return review;
    } else {
      const review = await this.dataSource.getRepository(HubReview).save({
        rating: payload.rating,
        comment: payload.comment,
        hub_id,
        user_id,
      });
      return review;
    }
  }

  //   Get review of Huub
  async getReviewByHubId(hub_id: string, query: PaginationDto) {
    const take = query?.limit || 10;
    const page = query?.page || 1;
    const skip = (page - 1) * take;

    const review = await this.dataSource
      .getRepository(HubReview)
      .createQueryBuilder('review')
      .where('review.hub_id = :hub_id', { hub_id })
      .leftJoin('review.user', 'user')
      .select([
        'review.id',
        'review.rating',
        'review.comment',
        'review.hub_id',
        'user.id',
        'user.full_name',
        'user.avatar',
      ])
      .take(take)
      .skip(skip)
      .getManyAndCount();
    return paginateResponse(review, page, take);
  }
}
