import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ServiceProviderService } from './service_provider.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { BookVerificationDto } from './dto/service_provider.dto';

@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly service_provider_service: ServiceProviderService,
  ) {}

  @Post('book/verify-complete/:book_id')
  @ResponseMessage(SuccessMessage.VERIFY, 'Booking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  bookVerification(
    @GetUser('id') service_provider_id: string,
    @Param('book_id', new ParseUUIDPipe()) book_id: string,
    @Body() payload: BookVerificationDto,
  ) {
    return this.service_provider_service.bookVerification(
      service_provider_id,
      book_id,
      payload,
    );
  }
}
