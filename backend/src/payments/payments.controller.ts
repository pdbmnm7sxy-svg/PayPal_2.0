import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaypalService } from '../paypal/paypal.service';
import { FabricService } from '../fabric/fabric.service';
import { SettlementService } from '../settlement/settlement.service';

@Controller('api')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService,
    private readonly fabricService: FabricService,
    private readonly settlementService: SettlementService,
  ) {}

  @Get('payments')
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('payments/stats')
  getStats() {
    return this.paymentsService.getStats();
  }

  @Get('payments/:id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post('payments')
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Post('payments/:id/paypal/create-order')
  createPayPalOrder(@Param('id') id: string) {
    return this.paymentsService.createPayPalOrder(id);
  }

  @Post('payments/:id/paypal/capture-order')
  capturePayPalOrder(
    @Param('id') id: string,
    @Body('orderId') orderId: string,
  ) {
    return this.paymentsService.capturePayPalOrder(id, orderId);
  }

  @Post('payments/:id/simulate-funding')
  simulateFunding(@Param('id') id: string) {
    return this.paymentsService.simulateDemoFunding(id);
  }

  @Post('payments/:id/commit-route')
  commitRoute(@Param('id') id: string) {
    return this.paymentsService.commitRoute(id);
  }

  @Post('payments/:id/settle')
  settle(@Param('id') id: string) {
    return this.paymentsService.processSettlement(id);
  }

  @Post('payments/:id/reconcile')
  reconcile(@Param('id') id: string) {
    return this.paymentsService.reconcilePayment(id);
  }

  @Get('payments/:id/ledger')
  getPaymentLedger(@Param('id') id: string) {
    return this.fabricService.getPaymentBlocks(id);
  }

  @Get('banks')
  getBanks() {
    return this.settlementService.getAllBanks();
  }

  @Get('ledger/blocks')
  getLedgerBlocks(@Query('limit') limit?: number) {
    return this.fabricService.getBlocks(limit ? Number(limit) : 50);
  }

  @Get('ledger/network')
  getLedgerNetwork() {
    return this.fabricService.getNetworkStatus();
  }

  @Get('paypal/config')
  getPayPalConfig() {
    return this.paypalService.getConfigStatus();
  }

  @Get('paypal/client-id')
  getPayPalClientId() {
    return this.paypalService.getClientIdForFrontend();
  }
}
