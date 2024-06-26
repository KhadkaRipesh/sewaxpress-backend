import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AddServiceToCartDto } from './dto/cart.dto';
import { Service } from 'src/services/entities/service.entity';
import { Cart, PaymentStatus } from './entities/cart.entity';
import { CartService as CartItem } from './entities/cart-service.entity';
import { IncomeAndTax } from 'src/income-tax/entities/income-tax.entity';
import { Hub } from 'src/hub/entities/hub.entity';

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
        'hub.id',
        'hub.name',
        'cart_services.id',
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
    let total_after_tax = 0;
    const tax = await this.dataSource.getRepository(IncomeAndTax).find();

    if (tax.length > 0) {
      console.log(tax);
      total_after_tax =
        total_after_discount + (tax[0].tax / 100) * total_after_discount;
    } else {
      total_after_tax = total_after_discount;
    }
    cart['total_after_tax'] = Number(total_after_tax.toFixed(2));

    //Calculate tax amount
    cart['tax_amount'] = Number(
      (total_after_tax - total_after_discount).toFixed(2),
    );

    // Calculate grand total
    let grand_total = 0;
    grand_total = total_after_tax;
    cart['grand_total'] = Number(grand_total.toFixed(2));

    return cart;
  }

  async addServiceOnCart(customer_id: string, payload: AddServiceToCartDto) {
    const service = await this.dataSource
      .getRepository(Service)
      .findOne({ where: { id: payload.service_id } });

    if (!service) throw new BadRequestException('Service Not Found.');

    const hub = await this.dataSource
      .getRepository(Hub)
      .findOne({ where: { id: payload.hub_id } });

    if (!hub) throw new BadRequestException('Hub not found for this service');

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
      });

      return this.getCart(customer_id);
    }
  }

  // // Update Service of cart
  // async updateServiceOnCart(
  //   customer_id: string,
  //   service_id: string,
  //   payload: UpdateServiceToCartDto,
  // ) {
  //   const service = await this.dataSource
  //     .getRepository(Cart)
  //     .findOne({ where: { customer_id, cart_services: { service_id } } });

  //   if (!service) throw new BadRequestException('Service does not exist.');

  //   await this.dataSource.getRepository(CartItem).save({
  //     id: service.cart_services[0].id,
  //   });

  //   return await this.getCart(customer_id);
  // }

  // Update Cart
  // async updateCart(
  //   customer_id: string,
  //   cart_id: string,
  //   payload: UpdateCartDto,
  // ) {
  //   const cart = await this.dataSource.getRepository(Cart).findOne({
  //     where: { id: cart_id, customer_id },
  //     relations: { hub: true },
  //   });
  //   if (!cart) throw new BadRequestException('Cannot found cart.');

  //   await this.dataSource
  //     .getRepository(Cart)
  //     .update({ id: cart_id }, { ...payload });
  //   return await this.getCart(customer_id);
  // }

  // Delete cart service--------
  async deleteServiceFromCart(customer_id: string, service_id: string) {
    const service = await this.dataSource.getRepository(Cart).findOne({
      where: { customer_id, cart_services: { service_id: service_id } },
      relations: ['cart_services'],
    });
    if (!service)
      throw new BadRequestException('Services does not exist on cart.');
    await this.dataSource
      .getRepository(CartItem)
      .delete({ id: service.cart_services[0].id });

    // if no cart remove hub from cart too
    if (service.cart_services.length === 0) {
      await this.dataSource
        .getRepository(Cart)
        .update({ id: service.id }, { hub_id: null });
    }
    return await this.getCart(customer_id);
  }

  // delete cart
  async deleteCart(customer_id: string) {
    const cart = await this.dataSource
      .getRepository(Cart)
      .findOne({ where: { customer_id } });
    if (!cart) throw new BadRequestException('Cart not found.');
    await this.dataSource.getRepository(Cart).delete({ id: cart.id });
    return { message: 'Cart deleted successfully.' };
  }
}
