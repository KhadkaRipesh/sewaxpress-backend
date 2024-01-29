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

@ApiTags('Firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}
}
