import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { User, UserRole } from './entities/user.entity';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { PaginationDto } from 'src/@helpers/pagination.dto';
import { UpdateUserDTO, UserFilterDTO } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFileFilter, filename } from 'src/@helpers/storage';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('current-user')
  @ResponseMessage(SuccessMessage.FETCH, 'user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: User) {
    return user;
  }

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

  // Update user profile
  @UseGuards(JwtAuthGuard)
  @ResponseMessage(SuccessMessage.UPDATE, 'User profile')
  @Patch('current-user')
  @ApiOperation({
    summary: 'Update current user ',
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'static/user/avatars',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  updateCurrentUser(
    @GetUser() user: User,
    @Body() payload: UpdateUserDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      payload.avatar = '/' + file.path;
    } else {
      payload.avatar = null;
    }
    return this.userService.updateCurrentUser(user, payload);
  }
}
