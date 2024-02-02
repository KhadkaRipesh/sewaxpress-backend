import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookVerificationDto } from './dto/service_provider.dto';

@Injectable()
export class ServiceProviderService {
  constructor(private readonly dataSource: DataSource) {}

  async bookVerification(
    user_id: string,
    service_provider_id: string,
    payload: BookVerificationDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
