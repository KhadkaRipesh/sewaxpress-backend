import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseMessage } from './@decoraters/response.decorater';
import { SuccessMessage } from './@utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ResponseMessage(SuccessMessage.FETCH, 'demo')
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @ResponseMessage(SuccessMessage.FETCH, 'Dashboard Data')
  @Get('dashboard')
  getdashboardData() {
    return this.appService.getDashbaoardData();
  }
}
