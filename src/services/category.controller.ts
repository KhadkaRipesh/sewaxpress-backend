import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { CategoryService } from './category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto/category.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { filename, imageFileFilter } from 'src/@helpers/storage';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // To create service category
  @ResponseMessage(SuccessMessage.CREATE, 'Service Category')
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SERVICE_PROVIDER)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({ destination: 'static/category', filename }),
      fileFilter: imageFileFilter,
    }),
  )
  register(
    @Body() payload: CreateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image for category is required.');
    payload.image = '/' + file.path;
    return this.categoryService.createCategory(payload);
  }

  // To get service category
  @ResponseMessage(SuccessMessage.FETCH, 'Service Category')
  @Get()
  getCategory(@Query() query: PaginationDto) {
    return this.categoryService.getServiceCategory(query);
  }

  // To get service category details
  @ResponseMessage(SuccessMessage.FETCH, 'Service Category')
  @Get(':category_id')
  getCategoryDetails(@Param('category_id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.getServiceCategoryDetails(id);
  }

  // To update service category details
  @ResponseMessage(SuccessMessage.UPDATE, 'Service Category')
  @Patch(':category_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({ destination: 'static/category', filename }),
      fileFilter: imageFileFilter,
    }),
  )
  updateCategoryDetail(
    @Param('category_id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateCategoryDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      payload.image = '/' + file.path;
    } else {
      payload.image = null;
    }
    return this.categoryService.updateCategoryDetails(id, payload);
  }

  //   To delete service category details
  @ResponseMessage(SuccessMessage.DELETE, 'Service Category')
  @Delete(':category_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param('category_id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
