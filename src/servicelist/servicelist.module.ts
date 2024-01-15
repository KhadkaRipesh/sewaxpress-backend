import { Module } from '@nestjs/common';
import { ServicelistController } from './servicelist.controller';
import { ServicelistService } from './servicelist.service';

@Module({
  controllers: [ServicelistController],
  providers: [ServicelistService],
})
export class ServicelistModule {}
