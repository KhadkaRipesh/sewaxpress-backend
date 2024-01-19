import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { filename, imageFileFilter } from 'src/@helpers/storage';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { CreateServiceDto } from './dto/service.dto';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { PaginationDto } from 'src/@helpers/pagination.dto';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // ------------------------Create Service
  @Post()
  @ResponseMessage(SuccessMessage.CREATE, 'Service')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Create New Service',
    description: UserRole.SERVICE_PROVIDER,
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SERVICE_PROVIDER)
  @ApiConsumes('multipart/form-data')
  @ApiConsumes('application/json')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({ destination: 'static/service', filename }),
      fileFilter: imageFileFilter,
    }),
  )
  createService(
    @GetUser('id') user_id: string,
    @Body() payload: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image for service is required.');
    payload.image = '/' + file.path;
    return this.serviceService.createService(user_id, payload);
  }

  //-------------------Get Service with filtering
  @Get('/:location/:category')
  @ResponseMessage(SuccessMessage.FETCH, 'Services')
  @ApiOperation({
    summary: 'Get Service',
  })
  getService(
    @Param('location') location: string,
    @Param('category') category_id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.serviceService.getAllService(location, category_id, pagination);
  }

  // ----------------------Get Own Service---------------------
  @Get('my-service')
  @ResponseMessage(SuccessMessage.FETCH, 'Service')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Get Own Service',
    description: UserRole.SERVICE_PROVIDER,
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SERVICE_PROVIDER)
  getMyService(
    @GetUser('id') user_id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.serviceService.getMyService(user_id, pagination);
  }

  @Patch('/:service_id')
  @ResponseMessage(SuccessMessage.UPDATE, 'Service')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Update a Service',
    description: UserRole.SERVICE_PROVIDER,
  })
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SERVICE_PROVIDER)
  @ApiConsumes('multipart/form-data')
  @ApiConsumes('application/json')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({ destination: 'static/service', filename }),
      fileFilter: imageFileFilter,
    }),
  )
  updateService(
    @GetUser('id') user_id: string,
    @Param('service_id', new ParseUUIDPipe()) service_id: string,
    @Body() payload: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.serviceService.updateService(
      user_id,
      service_id,
      payload,
      file,
    );
  }

  // ------------Get Service By Id
  @Get('/:service_id')
  @ResponseMessage(SuccessMessage.FETCH, 'Service')
  @ApiOperation({
    summary: 'Get Service',
  })
  getServiceById(@Param('service_id', new ParseUUIDPipe()) service_id: string) {
    return this.serviceService.getServiceById(service_id);
  }
}
