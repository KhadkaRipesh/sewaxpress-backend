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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { User, UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import { CreateRoomDto } from './dto/room.dto';
import { CreateChatDto } from './dto/chat.dto';
import { IPage } from 'src/socket/dto/socket.dto';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // CREATE ROOM-----------------------------------------
  @Post('room')
  @ResponseMessage(SuccessMessage.CREATE, 'Chat Room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createRoom(@GetUser() user: User, @Body() payload: CreateRoomDto) {
    return this.chatService.createRoom(user, payload);
  }

  // GET ALL ROOM-----------------------------------------
  @Get('room')
  @ResponseMessage(SuccessMessage.FETCH, 'Chat Room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER)
  getAllRoom(@GetUser() user: User) {
    return this.chatService.getMyAllRooms(user);
  }

  // GET ROOM-----------------------------------------
  @Get('room/:room_id')
  @ResponseMessage(SuccessMessage.FETCH, 'Chat Room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER)
  getRoom(
    @GetUser() user: User,
    @Param('room_id', new ParseUUIDPipe()) room_id: string,
  ) {
    return this.chatService.getRoom(user, room_id);
  }

  //   DELETE ROOM
  @Delete('room/:room_id')
  @ResponseMessage(SuccessMessage.DELETE, 'Chat Room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  deleteRoom(
    @GetUser() user: User,
    @Param('room_id', new ParseUUIDPipe()) room_id: string,
  ) {
    return this.chatService.deleteRoom(user, room_id);
  }

  // Send message -------------------------------------
  @Post('/send')
  @ResponseMessage(SuccessMessage.SENT, 'Chat')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER)
  sendMessage(@GetUser() user: User, @Body() payload: CreateChatDto) {
    return this.chatService.sendMessage(
      { user_id: user.id, role: user.role },
      payload,
    );
  }

  // GET ALL CHATS-----------------------------------------
  @Get('/:room_id')
  @ResponseMessage(SuccessMessage.FETCH, 'Chats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER)
  getAllChats(
    @GetUser() user: User,
    @Param('room_id', new ParseUUIDPipe()) room_id: string,
  ) {
    return this.chatService.getAllMessages(user, room_id);
  }

  //   DELETE CHAT
  @Delete('/:chat_id')
  @ResponseMessage(SuccessMessage.DELETE, 'Chat')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SERVICE_PROVIDER)
  deleteChat(
    @GetUser() user: User,
    @Param('chat_id', new ParseUUIDPipe()) chat_id: string,
  ) {
    return this.chatService.deleteChat(user, chat_id);
  }
}
