import { Module } from '@nestjs/common';
import { HubController } from './hub.controller';
import { HubService } from './hub.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hub } from './entities/hub.entity';
import { HubReview } from './entities/hub-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hub, HubReview])],
  controllers: [HubController],
  providers: [HubService],
})
export class HubModule {}
