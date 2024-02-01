import { Module } from '@nestjs/common';
import { ServiceProviderController } from './service_provider.controller';
import { ServiceProviderService } from './service_provider.service';

@Module({
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService]
})
export class ServiceProviderModule {}
