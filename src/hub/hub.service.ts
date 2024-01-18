import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateHubDto } from './dto/hub.dto';
import { Hub } from './entities/hub.entity';
import { BASE_URL } from 'src/@config/constants.config';

@Injectable()
export class HubService {
  constructor(private readonly dataSource: DataSource) {}

  //   Register Hub

  async registerHub(
    user_id: string,
    payload: CreateHubDto,
    files: Express.Multer.File[],
  ) {
    if (!files['avatar']) throw new BadRequestException('Avatar is required');
    if (!files['documents'])
      throw new BadRequestException('Documents are required');

    payload.avatar = '/' + files['avatar'][0].path;

    payload.documents = [];
    files['documents'].forEach((document) => {
      payload.documents.push('/' + document.path);
    });

    const hub = await this.dataSource.getRepository(Hub).save(payload);
    hub.avatar = BASE_URL.backend + hub.avatar;
    hub.documents = hub.documents.map((path) => BASE_URL.backend + path);

    return hub;
  }
}
