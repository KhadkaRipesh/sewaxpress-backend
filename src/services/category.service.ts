import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { paginateResponse } from 'src/@helpers/pagination';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto/category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly dataSource: DataSource) {}

  //   To create Category
  async createCategory(payload: CreateCategoryDTO): Promise<Category> {
    const new_category = await this.dataSource
      .getRepository(Category)
      .save(payload);
    return new_category;
  }

  //   To get service Category
  async getServiceCategory(query: PaginationDto) {
    const skip = (query.page - 1) * query.limit;
    const categories = await this.dataSource
      .getRepository(Category)
      .findAndCount({
        take: query.limit,
        skip: skip,
      });
    return paginateResponse(categories, query.page, query.limit);
  }
  //   To get individual service category detail
  async getServiceCategoryDetails(category_id: string) {
    const category_details = await this.dataSource
      .getRepository(Category)
      .findOne({ where: { id: category_id } });
    return category_details;
  }

  //   To update category details
  async updateCategoryDetails(category_id: string, payload: UpdateCategoryDTO) {
    const category = await this.getServiceCategoryDetails(category_id);
    category.category_name = payload.category_name;
    return await this.dataSource.getRepository(Category).save(category);
  }

  //   To delete the category
  async deleteCategory(category_id: string) {
    const to_delete = await this.getServiceCategoryDetails(category_id);
    return await this.dataSource.getRepository(Category).remove(to_delete);
  }
}
