import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { CartService } from 'src/cart/cart.service';
import { BookedService } from './entities/booked-entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BookedService])],
  controllers: [BookController],
  providers: [BookService, CartService],
})
export class BookModule {}
