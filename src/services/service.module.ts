import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  controllers: [ServiceController, CategoryController],
  providers: [ServiceService, CategoryService],
})
export class ServiceModule {}
