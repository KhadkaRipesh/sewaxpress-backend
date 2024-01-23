import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { ApiOperation } from '@nestjs/swagger';
import { CreateServiceBookDto } from './dto/book.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  //   To create booking
  @Post('/:hub_id')
  @ResponseMessage(SuccessMessage.CREATE, 'Service Booking')
  @ApiOperation({
    summary: 'Create New Order',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createBooking(
    @GetUser('id') customer_id: string,
    @Param('hub_id', new ParseUUIDPipe()) hub_id: string,
    @Body() payload: CreateServiceBookDto,
  ) {
    return this.bookService.createBooking(customer_id, hub_id, payload);
  }
}
