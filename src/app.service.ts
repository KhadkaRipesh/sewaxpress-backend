import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { Hub } from './hub/entities/hub.entity';
import { BookedService } from './book/entities/booked-entity';
import { Category } from './services/entities/category.entity';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}
  getHello() {
    return {
      health: 'ok',
      status: 200,
      docs: 'http://localhost:8848/docs/api',
      socket_docs: 'http://localhost:8848/docs/socket',
    };
  }

  // Get Dashboard Data
  async getDashbaoardData() {
    const userRepository = this.dataSource.getRepository(User);
    const hubRepository = this.dataSource.getRepository(Hub);
    const bookedRepository = this.dataSource.getRepository(BookedService);
    const categoryRepository = this.dataSource.getRepository(Category);

    const total_categories = await categoryRepository.count();
    const total_hubs = await hubRepository.count({
      where: { is_verified: true },
    });
    const booked_service = await bookedRepository.count();
    const totalUsers = await userRepository.count({
      where: [{ role: UserRole.SERVICE_PROVIDER }, { role: UserRole.CUSTOMER }],
    });

    return {
      total_categories,
      total_hubs,
      booked_service,
      totalUsers,
    };
  }
}
