import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
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
import {
  BookingFilterDto,
  ChangeBookStatus,
  CreateServiceBookDto,
} from './dto/book.dto';

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

  // Get All bookings of hub
  @Get()
  @ResponseMessage(SuccessMessage.FETCH, 'Bookings')
  @ApiOperation({
    summary: 'Get All Boookings Of Hub',
    description: `${UserRole.SERVICE_PROVIDER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  getAllBookings(
    @GetUser('id') service_provider_id: string,
    @Query() query: BookingFilterDto,
  ) {
    return this.bookService.getAllBooking(service_provider_id, query);
  }

  // Track my booking
  @Get('track')
  @ResponseMessage(SuccessMessage.FETCH, 'Bookings')
  @ApiOperation({
    summary: 'Track My Bookings',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  trackmyBooking(@GetUser('id') customer_id: string) {
    return this.bookService.trackBooking(customer_id);
  }

  // Get my all bookings
  @Get('my-booking')
  @ResponseMessage(SuccessMessage.FETCH, 'Bookings')
  @ApiOperation({
    summary: 'Get All My Bookings',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  getmyAllBookings(
    @GetUser('id') customer_id: string,
    @Query() query: BookingFilterDto,
  ) {
    return this.bookService.getAllMyBookings(customer_id, query);
  }

  // To change booking status - SERVICE PROVIDER
  @Post('change-status/:book_id')
  @ResponseMessage(SuccessMessage.UPDATE, 'Booking Status')
  @ApiOperation({
    summary: 'Update Booking Status',
    description: `${UserRole.SERVICE_PROVIDER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  changeBookStatus(
    @GetUser('id') service_provider_id: string,
    @Param('book_id', new ParseUUIDPipe()) book_id: string,
    @Body() payload: ChangeBookStatus,
  ) {
    return this.bookService.changeBookStatus(
      service_provider_id,
      book_id,
      payload,
    );
  }

  // Delete booking from Service Provider
  @Delete(':book_id')
  @ResponseMessage(SuccessMessage.DELETE, 'Booking')
  @ApiOperation({
    summary: 'Delete Booking',
    description: `${UserRole.SERVICE_PROVIDER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  deleteBooking(
    @GetUser('id') service_provider_id: string,
    @Param('book_id', new ParseUUIDPipe()) book_id: string,
  ) {
    return this.bookService.removeBooking(book_id, service_provider_id);
  }

  // Get booking details from customer
  @Get('customer/:book_id')
  @ResponseMessage(SuccessMessage.FETCH, 'Bookings')
  @ApiOperation({
    summary: 'Get All My Bookings',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  getCustomerBookingDetails(
    @GetUser('id') customer_id: string,
    @Param('book_id', new ParseUUIDPipe()) book_id: string,
  ) {
    return this.bookService.getCustomerBookingDetails(customer_id, book_id);
  }

  // Get booking details from service provider
  @Get('service-provider/:book_id')
  @ResponseMessage(SuccessMessage.FETCH, 'Bookings')
  @ApiOperation({
    summary: 'Get All My Bookings',
    description: `${UserRole.SERVICE_PROVIDER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  getServiceProviderBookingDetails(
    @GetUser('id') service_provider_id: string,
    @Param('book_id', new ParseUUIDPipe()) book_id: string,
  ) {
    return this.bookService.getServiceProviderBookingDetails(
      service_provider_id,
      book_id,
    );
  }
}
