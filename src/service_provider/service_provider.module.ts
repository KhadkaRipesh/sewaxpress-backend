import { Module } from '@nestjs/common';
import { ServiceProviderController } from './service_provider.controller';
import { ServiceProviderService } from './service_provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceProviderPaymentDetail } from './entities/service_provider-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProviderPaymentDetail])],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
})
export class ServiceProviderModule {}
