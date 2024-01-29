import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FirebaseService } from './firebase.service';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import {
  CreateFirebaseNotificationTokenDto,
  UpdateFirebaseNotificationTokenDto,
} from './dto/firebase.dto';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';

@ApiTags('Firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  // Save Token
  @Post('save-token')
  @ResponseMessage(SuccessMessage.STORED, 'Token')
  @ApiOperation({ summary: 'Create new token' })
  @UseGuards(JwtAuthGuard)
  createToken(
    @GetUser('id') user_id: string,
    @Body() payload: CreateFirebaseNotificationTokenDto,
  ) {
    return this.firebaseService.createToken(user_id, payload);
  }

  // Update Token
  @Patch('update-token/:token_id')
  @ResponseMessage(SuccessMessage.UPDATE, 'Token')
  @ApiOperation({ summary: 'Update token' })
  @UseGuards(JwtAuthGuard)
  updateToken(
    @GetUser('id') user_id: string,
    @Param('token_id') token_id: string,
    @Body() payload: UpdateFirebaseNotificationTokenDto,
  ) {
    return this.firebaseService.updateToken(user_id, token_id, payload);
  }

  // Delete Token
  @Patch('delete-token/:token_id')
  @ResponseMessage(SuccessMessage.DELETE, 'Token')
  @ApiOperation({ summary: 'Delete token' })
  @UseGuards(JwtAuthGuard)
  deleteToken(
    @GetUser('id') user_id: string,
    @Param('token_id') token_id: string,
  ) {
    return this.firebaseService.deleteToken(user_id, token_id);
  }
}
