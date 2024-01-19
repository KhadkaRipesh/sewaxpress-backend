import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
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

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

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

  //   Get Service with filtering
  @Get('/:location/:category')
  @ResponseMessage(SuccessMessage.FETCH, 'Services')
  @ApiOperation({
    summary: 'Get Service',
  })
  getService(
    @Param('location') location: string,
    @Param('category') category_id: string,
  ) {
    return this.serviceService.getAllService(location, category_id);
  }
}
