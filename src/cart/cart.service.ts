import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AddServiceToCartDto } from './dto/cart.dto';
import { Service } from 'src/services/entities/service.entity';
import { Cart, PaymentStatus } from './entities/cart.entity';
import { CartService as CartItem } from './entities/cart-service.entity';

@Injectable()
export class CartService {
  constructor(private readonly dataSource: DataSource) {}

  //   Get cart from customer id
  async getCart(customer_id: string) {
    const cart = await this.dataSource
      .getRepository(Cart)
      .createQueryBuilder('cart')
      .leftJoin('cart.hub', 'hub')
      .leftJoin('cart.cart_services', 'cart_services')
      .leftJoin('cart_services.service', 'service')
      .where('cart.customer_id = :customer_id', { customer_id })
      .select([
        'cart.id',
        'cart.customer_id',
        'cart.payment_status',
        'cart.booking_address',
        'cart.payment_id',
        'hub.id',
        'hub.name',
        'cart_services.id',
        'cart_services.note',
        'service.id',
        'service.name',
        'service.image',
        'service.price',
        'service.description',
        'service.estimated_time',
      ])
      .getOne();
    if (!cart) {
      return {
        id: null,
        customer_id,
        hub: {
          id: null,
          name: null,
        },
        cart_services: [],
        sub_total: 0,
        discount_amount: 0,
        total_after_discount: 0,
        tax_amount: 0,
        total_after_tax: 0,
        delivery_charge: 0,
        delivery_type: null,
        booking_address: null,
        grand_total: 0,
        payment_status: null,
        payment_id: null,
      };
    }
    // Calculate total price before discount

    let sub_total = 0;
    for (let i = 0; i < cart.cart_services.length; i++) {
      sub_total += cart.cart_services[i].service.price;
    }
    cart['sub_total'] = sub_total;

    // discount logic here

    // ends and update price

    // total price after discount
    let total_after_discount = 0;
    for (let i = 0; i < cart.cart_services.length; i++) {
      total_after_discount += cart.cart_services[i].service.price;
    }
    cart['total_after_discount'] = Number(total_after_discount.toFixed(2));

    //Calculate discount amount
    cart['discount_amount'] = Number(
      (sub_total - total_after_discount).toFixed(2),
    );

    // Calculate tax from here

    // Calculate grand total
    let grand_total = 0;
    grand_total = total_after_discount;
    cart['grand_total'] = Number(grand_total.toFixed(2));

    return cart;
  }

  async addServiceOnCart(customer_id: string, payload: AddServiceToCartDto) {
    const service = await this.dataSource
      .getRepository(Service)
      .findOne({ where: { id: payload.service_id } });

    if (!service) throw new BadRequestException('Service Not Found.');
    if (!service.is_available)
      throw new BadRequestException('Service is not available for now.');

    const [cart, total] = await this.dataSource
      .getRepository(Cart)
      .findAndCount({ where: { customer_id: customer_id } });
    if (cart[0]) {
      if (cart[0].payment_status === PaymentStatus.COMPLETED) {
        throw new BadRequestException('Cannod add service after paying');
      }
    }

    if (!total) {
      const cart = await this.dataSource
        .getRepository(Cart)
        .save({ customer_id, hub_id: payload.hub_id });
      await this.dataSource.getRepository(CartItem).save({
        cart_id: cart.id,
        ...payload,
      });
      return this.getCart(customer_id);
    } else {
      if (cart[0].hub_id !== payload.hub_id) {
        throw new BadRequestException(
          'You cannot add different hubs services on same cart.',
        );
      }

      const itemExist = await this.dataSource.getRepository(Cart).findOne({
        where: {
          customer_id,
          cart_services: { service_id: service.id },
          hub_id: service.hub_id,
        },
        relations: ['cart_services'],
      });
      if (itemExist)
        throw new BadRequestException('Service is Already on Cart.');
      await this.dataSource.getRepository(CartItem).save({
        cart_id: cart[0].id,
        service_id: payload.service_id,
        note: payload.note,
      });

      return this.getCart(customer_id);
    }
  }
}
