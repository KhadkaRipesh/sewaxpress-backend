import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
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

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // To create service category
  @ResponseMessage(SuccessMessage.CREATE, 'Service Category')
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SERVICE_PROVIDER)
  register(@Body() payload: CreateCategoryDTO) {
    return this.categoryService.createCategory(payload);
  }

  // To get service category
  @ResponseMessage(SuccessMessage.FETCH, 'Service Category')
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCategory(@Query() query: PaginationDto) {
    return this.categoryService.getServiceCategory(query);
  }

  // To get service category details
  @ResponseMessage(SuccessMessage.FETCH, 'Service Category')
  @Get('category-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getCategoryDetails(@Param('category-id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.getServiceCategoryDetails(id);
  }

  // To update service category details
  @ResponseMessage(SuccessMessage.UPDATE, 'Service Category')
  @Patch('category-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCategoryDetail(
    @Param('category-id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateCategoryDTO,
  ) {
    return this.categoryService.updateCategoryDetails(id, payload);
  }

  //   To delete service category details
  @ResponseMessage(SuccessMessage.DELETE, 'Service Category')
  @Delete('category-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param('category-id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
