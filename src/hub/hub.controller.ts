import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HubService } from './hub.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { filename, imageFileFilter } from 'src/@helpers/storage';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { User, UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decoraters/getUser.decorater';
import {
  CreateHubDto,
  GetHubByStatusDto,
  UpdateHubByAdminDto,
  UpdateHubDto,
} from './dto/hub.dto';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { CreateHubReviewDto } from './dto/hub-review.dto';
import { PaginationDto } from 'src/@helpers/pagination.dto';

@ApiTags('Service hub')
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

  @Post()
  @ApiOperation({ summary: 'Create a Hub' })
  @ResponseMessage(SuccessMessage.CREATE, 'service hub')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'documents', maxCount: 3 },
        { name: 'citizenship_front', maxCount: 3 },
        { name: 'citizenship_back', maxCount: 3 },
      ],
      {
        storage: diskStorage({
          destination: 'static/hub',
          filename,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  registerHub(
    @Body() payload: CreateHubDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hubService.registerHub(payload, files);
  }

  //   Get All Hubs by Admin
  @Get('admin')
  @ApiOperation({ summary: 'Get All Hub', description: UserRole.ADMIN })
  @ResponseMessage(SuccessMessage.FETCH, 'service hub')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  getAllShopsByStatus(@Query() query: GetHubByStatusDto) {
    return this.hubService.getAllHubsByStatus(query);
  }

  //  Get Own Hubs
  @Get('my-hub')
  @ApiOperation({ summary: 'Get own hub' })
  @ResponseMessage(SuccessMessage.FETCH, 'service hub')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SERVICE_PROVIDER)
  async getMyHub(@GetUser('id') user_id: string) {
    return this.hubService.getMyHub(user_id);
  }

  // ---------- GET A Hub ----------
  @Get('/:hub_id')
  @ApiOperation({ summary: 'Get hub by Id' })
  @ResponseMessage(SuccessMessage.FETCH, 'service hub')
  @ApiOperation({
    summary: 'Get a Particular Hub.',
  })
  getHubById(@Param('hub_id', ParseUUIDPipe) hub_id: string) {
    return this.hubService.getHubById(hub_id);
  }

  @Patch('/:hud_id')
  @ApiOperation({ summary: 'Update a Hub' })
  @ResponseMessage(SuccessMessage.UPDATE, 'service hub')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SERVICE_PROVIDER, UserRole.ADMIN)
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }], {
      storage: diskStorage({
        destination: 'static/hub',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  updateHub(
    @GetUser() user: User,
    @Param('hub_id', new ParseUUIDPipe()) hub_id: string,
    @Body() payload: UpdateHubDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hubService.updateHub(user, hub_id, payload, files);
  }

  @Patch('admin/:hub_id')
  @ApiOperation({ summary: 'Update Hub Status' })
  @ResponseMessage(SuccessMessage.UPDATE, 'service hub')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  UpdateHubStatusByAdmin(
    @Param('hub_id', new ParseUUIDPipe()) hub_id: string,
    @Body() payload: UpdateHubByAdminDto,
  ) {
    return this.hubService.UpdateHubStatusByAdmin(hub_id, payload);
  }

  // UpdateHubStatusByAdmin

  //   Review for Hub
  @Post('review/:hub_id')
  @ApiOperation({ summary: 'Review a Hub' })
  @ResponseMessage(SuccessMessage.CREATE, 'hub review')
  @ApiOperation({
    summary: 'Review a Shop',
    description: `${UserRole.CUSTOMER}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.CUSTOMER)
  reviewHub(
    @Param('hub_id', new ParseUUIDPipe()) hub_id: string,
    @GetUser('id') user_id: string,
    @Body() payload: CreateHubReviewDto,
  ) {
    return this.hubService.reviewHub(user_id, hub_id, payload);
  }

  //   Get review of hub
  @Get('review/:hub_id')
  @ApiOperation({ summary: 'Get Reviews of Hub' })
  @ResponseMessage(SuccessMessage.FETCH, 'hub review')
  getReviewByHubId(
    @Param('shop_id', ParseUUIDPipe) hub_id: string,
    @Query() query: PaginationDto,
  ) {
    return this.hubService.getReviewByHubId(hub_id, query);
  }
}
