import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Category])],
  controllers: [ServiceController, CategoryController],
  providers: [ServiceService, CategoryService],
})
export class ServiceModule {}
