import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { User, UserRole } from './entities/user.entity';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { UserFilterDTO } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('current-user')
  @ResponseMessage(SuccessMessage.FETCH, 'user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: User) {
    return user;
  }

  // Filter users with roles
  @Get('filter-users')
  @ResponseMessage(SuccessMessage.FETCH, 'Users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUSers(
    @Query() query: PaginationDto,
    @Query() filter: UserFilterDTO,
  ) {
    return this.userService.getAllUsers(query, filter);
  }
}
