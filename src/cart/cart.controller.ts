import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { AddServiceToCartDto, UpdateServiceToCartDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //   Add service to the cart
  @Post()
  @ResponseMessage(SuccessMessage.ADD, 'Service')
  @ApiOperation({
    summary: 'Add Item To Cart',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  addServiceOnCart(
    @GetUser('id') customer_id: string,
    @Body() payload: AddServiceToCartDto,
  ) {
    return this.cartService.addServiceOnCart(customer_id, payload);
  }

  // Payment

  @Post('payment')
  @ResponseMessage(SuccessMessage.ADD, 'Service')
  @ApiOperation({
    summary: 'Make Payment',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  makePayment(@GetUser('id') customer_id: string) {
    return this.cartService.makePayment(customer_id);
  }

  // Update Cart
  // @Patch(':cart_id')
  // @ResponseMessage(SuccessMessage.UPDATE, 'Cart')
  // @ApiOperation({ summary: 'Update Cart', description: `${UserRole.CUSTOMER}` })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.CUSTOMER)
  // updateCart(
  //   @GetUser('id') customer_id: string,
  //   @Body() payload: UpdateCartDto,
  //   @Param('cart_id', new ParseUUIDPipe()) cart_id: string,
  // ) {
  //   return this.cartService.updateCart(customer_id, cart_id, payload);
  // }

  // Update service on  Cart
  @Patch('service/:service_id')
  @ResponseMessage(SuccessMessage.UPDATE, 'Cart service')
  @ApiOperation({ summary: 'Update Cart', description: `${UserRole.CUSTOMER}` })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  updateServiceOnCart(
    @GetUser('id') customer_id: string,
    @Body() payload: UpdateServiceToCartDto,
    @Param('service_id', new ParseUUIDPipe()) service_id: string,
  ) {
    return this.cartService.updateServiceOnCart(
      customer_id,
      service_id,
      payload,
    );
  }

  @ResponseMessage(SuccessMessage.DELETE, ' Cart Service')
  @Delete('service/:service_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  deleteServiceFromCart(
    @GetUser('id') customer_id: string,
    @Param('service_id', new ParseUUIDPipe()) service_id: string,
  ) {
    return this.cartService.deleteServiceFromCart(customer_id, service_id);
  }

  @Delete()
  @ResponseMessage(SuccessMessage.DELETE, 'Cart')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  deleteCart(@GetUser('id') customer_id: string) {
    return this.cartService.deleteCart(customer_id);
  }

  @Get()
  @ResponseMessage(SuccessMessage.FETCH, 'Cart')
  @ApiOperation({
    summary: 'Get user cart',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  getCart(@GetUser('id') customer_id: string) {
    return this.cartService.getCart(customer_id);
  }
}
