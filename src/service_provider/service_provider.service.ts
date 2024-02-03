import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookVerificationDto } from './dto/service_provider.dto';
import { Book } from 'src/book/entities/book.entity';
import { BookStatus } from 'src/book/dto/book.dto';

@Injectable()
export class ServiceProviderService {
  constructor(private readonly dataSource: DataSource) {}

  async bookVerification(
    user_id: string,
    book_id: string,
    payload: BookVerificationDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userValid = await this.dataSource.getRepository(Book).findOne({
        where: {
          service_provider_id: user_id,
          id: book_id,
          book_status: BookStatus.bookingProcessing,
        },
      });

      if (!userValid)
        throw new BadRequestException('Book does not belongs to you.');

      const book = await this.dataSource.getRepository(Book).findOne({
        where: { id: book_id },
        relations: ['hub'],
        select: {
          id: true,
          book_otp: true,
          price_after_tax: true,
          hub: { user_id: true },
          customer_id: true,
        },
      });

      if (book.book_otp !== payload.code)
        throw new BadRequestException('Invalid code.');

      if (book.book_status !== BookStatus.bookingCompleted)
        throw new BadRequestException('Book has already been completed.');

      // Cut commission from book
      // Save earnings
      // handle notifications and history
      await queryRunner.commitTransaction();
      return 'Book completed.';
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
