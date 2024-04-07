import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  BookStatus,
  BookingFilterDto,
  CancelBooking,
  ChangeBookStatus,
  CreateServiceBookDto,
  FilterByDateType,
} from './dto/book.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartService } from 'src/cart/cart.service';
import { generateOTP } from 'src/@helpers/otp';
import { Book } from './entities/book.entity';
import { CartService as CartItems } from 'src/cart/entities/cart-service.entity';
import { BookedService } from './entities/booked-entity';
import { sendMail } from 'src/@helpers/mail';
import { bookingMailTemplate } from 'src/@utils/mail-template';
import { applyDateFilter } from 'src/@filter/dateFilter';
import { Hub } from 'src/hub/entities/hub.entity';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  Notification,
  NotificationType,
} from 'src/notification/entities/notification.entity';
import axios from 'axios';
import { error } from 'console';
import { KHALTI_SECRET } from 'src/@config/constants.config';

@Injectable()
export class BookService {
  constructor(
    private readonly dataSource: DataSource,
    private cartService: CartService,
    private firebaseService: FirebaseService,
  ) {}

  async createBooking(customer_id: string, payload: CreateServiceBookDto) {
    console.log(payload);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager
        .getRepository(Cart)
        .createQueryBuilder('cart')
        .leftJoin('cart.customer', 'customer')
        .leftJoinAndSelect('cart.hub', 'hub')
        .leftJoinAndSelect('hub.user', 'user')
        .leftJoin('cart.cart_services', 'cart_services')
        .leftJoin('cart_services.service', 'service')
        .leftJoin('service.category', 'category')
        .where('customer.id = :customer_id', { customer_id })
        .select([
          'cart',
          'hub.user_id',
          'hub.name',
          'cart_services.id',
          'cart_services.service_id',
          'user',
          'service',
          'customer',
          'category',
        ])
        .getOne();

      if (!cart)
        throw new BadRequestException(
          'There is no services on cart to book service.',
        );
      const cartDetails = await this.cartService.getCart(customer_id);

      const booking_otp = await generateOTP(6);

      const book = await queryRunner.manager.getRepository(Book).save({
        customer_id,
        hub_id: cart.hub_id,
        booking_date: payload.booking_date,
        book_otp: booking_otp,
        booking_address: payload.booking_address,
        sub_total: cartDetails['sub_total'],
        discount_amount: cartDetails['discount_amount'],
        price_after_discount: cartDetails['total_after_discount'],
        tax_amount: cartDetails['tax_amount'],
        price_after_tax: cartDetails['total_after_tax'],
        total_before_bid: cartDetails['grand_total'],
        customer_bid: payload.after_fare_price - cartDetails['grand_total'],
        grand_total: payload.after_fare_price,
      });

      //   Save the booked service
      for (let i = 0; i < cart.cart_services.length; i++) {
        // save each booked services
        await queryRunner.manager.getRepository(BookedService).save({
          booked_id: book.id,
          service_id: cart.cart_services[i].service_id,
          price: cart.cart_services[i].service.price,
        });
      }

      //   delete cart and cart services
      for (let i = 0; i < cart.cart_services.length; i++) {
        await queryRunner.manager.getRepository(CartItems).delete({
          id: cart.cart_services[i].id,
        });
      }

      //   Prepare for email
      const serviceNames = cart.cart_services.map(
        (service) => service.service.name,
      );
      const serviceList = serviceNames.join(', ');
      const categoryNames = cart.cart_services.map(
        (service) => service.service.category.category_name,
      );
      const categoryList = categoryNames.join(', ');

      const notification = [
        // for customer
        {
          title: 'Book requested.',
          body: 'You have requested service from ' + cart.hub.name,
          user_id: cart.customer.id,
          notification_type: NotificationType.BOOK,
        },
        // for service provider
        {
          title: 'Book requested.',
          body: 'Your service is requested from' + book.booking_address,
          user_id: cart.hub.user.id,
          notification_type: NotificationType.BOOK,
        },
      ];

      await this.dataSource.getRepository(Notification).save(notification);

      const email = [
        // for customer
        {
          title: 'Booking Confirmation',
          message:
            'Your booking request has been sent to service provider. You will be notified from service provider as soon as posible.',
          name: cart.customer.full_name,
          service_name: serviceList,
          service_category: categoryList,
          cost: book.grand_total,
          email: cart.customer.email,
          phone: cart.customer.phone_number,
          address: book.booking_address,
          date: book.booking_date,
        },

        // for service provider
        {
          title: 'Booking Confirmation',
          message: 'The service of your hub has been requested.',
          name: cart.hub.user.full_name,
          service_name: serviceList,
          service_category: categoryList,
          cost: book.grand_total,
          email: cart.customer.email,
          phone: cart.customer.phone_number,
          address: book.booking_address,
          date: book.booking_date,
        },
      ];

      // send email to customer
      sendMail({
        to: cart.customer.email,
        subject: 'Booking Confirmation',
        html: bookingMailTemplate(email[0]),
      });

      // send email to service provider
      sendMail({
        to: cart.hub.user.email,
        subject: 'Booking Requested',
        html: bookingMailTemplate(email[1]),
      });

      await this.firebaseService.sendPushNotifications([cart.hub.user.id], {
        title: 'Service Request',
        body: `New service book requested by ${cart.customer.full_name}`,
      });

      await queryRunner.commitTransaction();
      return book;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      queryRunner.release;
    }
  }

  // Get All booking
  async getAllBooking(service_provider_id: string, query: BookingFilterDto) {
    //Validate custom filter date
    if (query && query.date === FilterByDateType.CUSTOM) {
      if (!query.start_date || !query.end_date) {
        return { message: 'Please provide start date and end date.' };
      }
    }

    let sql = this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.hub', 'hub')
      .where('hub.user_id =:service_provider_id', { service_provider_id })
      .leftJoinAndSelect('book.customer', 'customer')
      .leftJoinAndSelect('book.booked_services', 'booked_services')
      .orderBy('book.booking_date', 'DESC');

    if (query) {
      if (query.book_status) {
        sql = sql.where('book.book_status =:book_status', {
          book_status: query.book_status,
        });
      }
      if (query.date) {
        sql = applyDateFilter(sql, query, 'book', 'booking_date');
      }
    }
    const result = await sql.getMany();

    return result;
  }

  // Track booking
  async trackBooking(customer_id: string) {
    const booking = await this.dataSource.getRepository(Book).find({
      where: { customer_id },
      relations: {
        hub: true,
        booked_services: { service: true },
        customer: true,
      },
      select: {
        id: true,
        book_status: true,
        booking_date: true,
        booking_address: true,
        book_otp: true,
        customer: { full_name: true, email: true },
        hub: { name: true, avatar: true, address: true },
        booked_services: {
          id: true,
          service_id: true,
          service: { name: true },
          price: true,
        },
        sub_total: true,
        grand_total: true,
      },
    });
    if (!booking) throw new BadRequestException('Booking not found.');
    return booking;
  }

  // Get My All bookings (CUSTOMER)

  async getAllMyBookings(customer_id: string, query: BookingFilterDto) {
    //Validate custom filter date
    if (query && query.date === FilterByDateType.CUSTOM) {
      if (!query.start_date || !query.end_date) {
        return { message: 'Please provide start date and end date.' };
      }
    }

    let sql = this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.customer', 'customer')
      .where('customer.id = :customer_id', { customer_id })
      .leftJoinAndSelect('book.hub', 'hub')
      .leftJoinAndSelect('book.booked_services', 'booked_services')
      .leftJoinAndSelect('booked_services.service', 'service')
      .select([
        'customer_id',
        'customer.full_name',
        'customer.email',
        'book.id',
        'book.booking_address',
        'book.booking_date',
        'book.book_status',
        'book.book_otp',
        'book.paid_to_serviceProvider',
        'book.hasCustomerPaid',
        'hub.name',
        'hub.address',
        'hub.avatar',
        'service.id',
        'service.name',
        'booked_services.id',
        'booked_services.price',
        'book.sub_total',
        'book.grand_total',
      ])
      .orderBy('book.booking_date', 'DESC');

    if (query) {
      if (query.book_status) {
        sql = sql.where('book.book_status =:book_status', {
          book_status: query.book_status,
        });
      }
      if (query.date) {
        sql = applyDateFilter(sql, query, 'book', 'booking_date');
      }
    }
    const result = await sql.getMany();
    return result;
  }

  async changeBookStatus(
    service_provider_id: string,
    book_id: string,
    payload: ChangeBookStatus,
  ) {
    // find hub associated with service provider
    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { user_id: service_provider_id } });
    if (!hub) throw new BadRequestException('Hub not found.');

    // find booking from book id and hub id
    const book = await this.dataSource
      .getRepository(Book)
      .findOne({ where: { id: book_id, hub_id: hub.id } });
    if (!book) throw new BadRequestException('There is no book for your hub.');

    // Update the book status in the database
    const updatedBook = await this.dataSource.getRepository(Book).save({
      id: book_id,
      book_status: payload.book_status,
      cancelled_reason: payload.cancelled_reason
        ? payload.cancelled_reason
        : null,
    });

    // prepare for notification to notify customer

    return `Booking ${updatedBook.book_status}`;
  }

  // Delete Booking - seller
  async removeBooking(book_id: string, service_provider_id: string) {
    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { user_id: service_provider_id } });

    const book = await this.dataSource
      .getRepository(Book)
      .findOne({ where: { id: book_id, hub_id: hub.id } });

    if (!book)
      throw new BadRequestException(
        'You are not authorized to delete booking.',
      );

    await this.dataSource.getRepository(Book).delete(book_id);

    return { message: 'Booking deleted successfully.' };
  }

  // Get Booking details from Customer
  async getCustomerBookingDetails(customer_id: string, book_id: string) {
    const book = await this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.customer', 'customer')
      .leftJoinAndSelect('book.hub', 'hub')
      .leftJoinAndSelect('book.booked_services', 'booked_services')
      .leftJoinAndSelect('booked_services.service', 'service')
      .where('book.customer_id =:customer_id', { customer_id })
      .andWhere('book.id =:book_id', { book_id })
      .select([
        'customer_id',
        'customer.full_name',
        'customer.email',
        'book.id',
        'book.booking_address',
        'book.booking_date',
        'book.book_status',
        'book.book_otp',
        'book.paid_to_serviceProvider',
        'book.hasCustomerPaid',
        'hub.name',
        'hub.address',
        'hub.avatar',
        'service.id',
        'service.name',
        'service.estimated_time',
        'booked_services.id',
        'booked_services.note',
        'booked_services.price',
        'book.sub_total',
        'book.grand_total',
      ])
      .getOne();

    if (!book) throw new BadRequestException('Book not found.');

    return book;
  }

  // Get Book details from Service Provider
  async getServiceProviderBookingDetails(
    service_provider_id: string,
    book_id: string,
  ) {
    const book = await this.dataSource
      .getRepository(Book)
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.customer', 'customer')
      .leftJoinAndSelect('book.hub', 'hub')
      .leftJoinAndSelect('book.booked_services', 'booked_services')
      .leftJoinAndSelect('booked_services.service', 'service')
      .where('hub.user_id =:service_provider_id', { service_provider_id })
      .andWhere('book.id =:book_id', { book_id })
      .select([
        'customer_id',
        'customer.full_name',
        'customer.email',
        'book.id',
        'book.booking_address',
        'book.booking_date',
        'book.book_status',
        'book.book_otp',
        'hub.name',
        'hub.address',
        'hub.avatar',
        'service.id',
        'service.name',
        'service.estimated_time',
        'booked_services.id',
        'booked_services.note',
        'booked_services.price',
        'book.sub_total',
        'book.grand_total',
      ])
      .getOne();

    if (!book) throw new BadRequestException('Book not found.');

    return book;
  }

  // Cancel Booking
  async cancelBooking(
    customer_id: string,
    book_id: string,
    payload: CancelBooking,
  ) {
    const book = await this.dataSource
      .getRepository(Book)
      .findOne({ where: { id: book_id, customer_id } });
    if (!book) throw new BadRequestException('Unable to cancel.');

    const bookStatus = book.book_status;
    if (bookStatus !== BookStatus.bookingPlaced)
      throw new BadRequestException(
        `Book can't be cancelled. It's on status: ${book.book_status}`,
      );

    await this.dataSource.getRepository(Book).save({
      id: book_id,
      customer_id,
      book_status: BookStatus.bookingCancelled,
      cancelled_reason: payload.cancelled_reason
        ? payload.cancelled_reason
        : null,
    });

    // create notification for service provider

    return true;
  }

  // ----Payement-----
  async makePayment(customer_id: string, book_id: string) {
    const book = await this.dataSource
      .getRepository(Book)
      .findOne({ where: { customer_id: customer_id, id: book_id } });

    if (!book)
      throw new BadRequestException('User doesnot has any booking services.');

    // Khalti setup
    try {
      const res = await axios.post(
        `https://a.khalti.com/api/v2/epayment/initiate/`,
        {
          return_url: `http://localhost:8000/book/${book_id}`,
          website_url: 'http://localhost:8000',
          amount: 10000,
          purchase_order_id: book.id,
          purchase_order_name: 'Test',
          customer_info: {
            name: 'Test User',
            email: 'test@khalti.com',
            phone: '9800000001',
          },
        },
        {
          headers: {
            Authorization: KHALTI_SECRET,
            'Content-Type': 'application/json',
          },
        },
      );

      // save payment
      await this.dataSource
        .getRepository(Book)
        .update(
          { id: book.id },
          { payment_id: res.data.pidx, hasCustomerPaid: true },
        );

      return res.data.payment_url;
    } catch (error) {}
    console.log('Error', error.toString);
  }
}
