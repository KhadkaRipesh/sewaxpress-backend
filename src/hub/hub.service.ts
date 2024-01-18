import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateHubDto } from './dto/hub.dto';
import { Hub } from './entities/hub.entity';
import { BASE_URL } from 'src/@config/constants.config';
import { error } from 'console';

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
}
