import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { User, UserRole } from './entities/user.entity';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('current-user')
  @ResponseMessage(SuccessMessage.FETCH, 'user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
