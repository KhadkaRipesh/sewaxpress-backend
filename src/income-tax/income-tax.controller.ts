import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IncomeTaxService } from './income-tax.service';
import { ResponseMessage } from 'src/@decoraters/response.decorater';
import { SuccessMessage } from 'src/@utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/@guards/auth.guard';
import { RolesGuard } from 'src/@guards/roles.guard';
import { Roles } from 'src/@decoraters/getRole.decorater';
import { CreateIncomeTaxDto, UpdateIncomeTaxDto } from './dto/income-tax.dto';

@ApiTags('Income and Tax')
@Controller('income-tax')
export class IncomeTaxController {
  constructor(private readonly incomeTaxService: IncomeTaxService) {}

  // create income tax

  @Post()
  @ResponseMessage(SuccessMessage.CREATE, 'Income and Tax')
  @ApiOperation({
    summary: 'Create income and tax details',
    description: `${UserRole.ADMIN}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createIncomeAndTax(@Body() payload: CreateIncomeTaxDto) {
    return this.incomeTaxService.createIncomeAndTax(payload);
  }

  // Get income and tax details

  @Get()
  @ResponseMessage(SuccessMessage.FETCH, 'Income and Tax')
  @ApiOperation({
    summary: 'Get income and tax details',
    description: `${UserRole.ADMIN}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getIncomeAndTax() {
    return this.incomeTaxService.getIncomeAndTax();
  }

  // Update income tax details

  @Patch('/:id')
  @ResponseMessage(SuccessMessage.UPDATE, 'Income and Tax')
  @ApiOperation({
    summary: 'Update income and tax details',
    description: `${UserRole.ADMIN}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateIncomeAndTax(
    @Body() payload: UpdateIncomeTaxDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.incomeTaxService.updateIncomeAndTax(id, payload);
  }
}
