import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateServiceBookDto } from './dto/book.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartService } from 'src/cart/cart.service';
import { generateOTP } from 'src/@helpers/otp';
import { Book } from './entities/book.entity';
import { CartService as CartItems } from 'src/cart/entities/cart-service.entity';

@Injectable()
export class BookService {
  constructor(
    private readonly dataSource: DataSource,
    private cartService: CartService,
  ) {}

  async createBooking(
    customer_id: string,
    hub_id: string,
    payload: CreateServiceBookDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager
        .getRepository(Cart)
        .createQueryBuilder('cart')
        .leftJoin('cart.customer', 'customer')
        .leftJoinAndSelect('cart.hub', 'hub')
        .leftJoin('cart.cart_services', 'cart_services')
        .leftJoin('cart_services.service', 'service')
        .where('customer.id = :customer_id', { customer_id })
        .select([
          'cart',
          'hub.user_id',
          'cart_services.id',
          'cart_services.service_id',
          'cart_services.note',
          'service',
        ])
        .getOne();

      const cartDetails = await this.cartService.getCart(customer_id);

      const booking_otp = await generateOTP(6);

      const book = await queryRunner.manager.getRepository(Book).save({
        customer_id,
        hub_id,
        booking_date: payload.booking_date,
        book_otp: booking_otp,
        booking_address: payload.booking_address,
        sub_total: cartDetails['sub_total'],
        discount_amount: cartDetails['discount_amount'],
        price_after_discount: cartDetails['total_after_discount'],
        tax_amount: cartDetails['tax_amount'],
        price_after_tax: cartDetails['total_after_tax'],
        grand_total: cartDetails['grand_total'],
      });

      //   Save the ordered service

      for (let i = 0; i < cart.cart_services.length; i++) {
        let price = cart.cart_services[i].service.price;

        // save ordered services
      }

      //   delete cart and cart services
      for (let i = 0; i < cart.cart_services.length; i++) {
        await queryRunner.manager.getRepository(CartItems).delete({
          id: cart.cart_services[i].id,
        });
      }

      await queryRunner.manager.getRepository(Cart).delete({
        id: cart.id,
      });

      //   Prepare for email

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      queryRunner.release;
    }
  }
}
