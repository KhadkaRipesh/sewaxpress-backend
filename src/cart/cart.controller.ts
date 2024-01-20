import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { AddServiceToCartDto } from './dto/cart.dto';

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
    @Body() paylaod: AddServiceToCartDto,
  ) {
    return this.cartService.addServiceOnCart(customer_id, paylaod);
  }
}
