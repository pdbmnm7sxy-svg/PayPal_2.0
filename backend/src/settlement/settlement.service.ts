import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { BankNode } from '../entities/bank-node.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { EventsGateway } from '../events/events.gateway';
import { FabricService } from '../fabric/fabric.service';

export const INITIAL_BANK_NODES: Array<Partial<BankNode>> = [
  {
    code: 'GSB_US',
    name: 'Global Settlement Bank',
    country: 'US',
    currency: 'USD',
    initialLiquidity: 45000000.0,
    liquidityBalance: 45000000.0,
    totalSettledVolume: 1250000.0,
    activeTransfersCount: 3,
    status: 'ACTIVE',
  },
  {
    code: 'EUROT_DE',
    name: 'EuroTransact AG',
    country: 'DE',
    currency: 'EUR',
    initialLiquidity: 38000000.0,
    liquidityBalance: 38000000.0,
    totalSettledVolume: 980000.0,
    activeTransfersCount: 2,
    status: 'ACTIVE',
  },
  {
    code: 'PACIFIC_SG',
    name: 'Pacific Rim Financial',
    country: 'SG',
    currency: 'SGD',
    initialLiquidity: 55000000.0,
    liquidityBalance: 55000000.0,
    totalSettledVolume: 820000.0,
    activeTransfersCount: 1,
    status: 'ACTIVE',
  },
  {
    code: 'INT_LDN',
    name: 'London Interbank Clearing Hub',
    country: 'GB',
    currency: 'GBP',
    initialLiquidity: 75000000.0,
    liquidityBalance: 75000000.0,
    totalSettledVolume: 2400000.0,
    activeTransfersCount: 4,
    status: 'ACTIVE',
  },
  {
    code: 'INT_TOK',
    name: 'Tokyo Correspondent Gateway',
    country: 'JP',
    currency: 'JPY',
    initialLiquidity: 60000000.0,
    liquidityBalance: 60000000.0,
    totalSettledVolume: 1100000.0,
    activeTransfersCount: 1,
    status: 'ACTIVE',
  },
  {
    code: 'INT_ZUR',
    name: 'Zurich Intermediary Trust',
    country: 'CH',
    currency: 'CHF',
    initialLiquidity: 85000000.0,
    liquidityBalance: 85000000.0,
    totalSettledVolume: 1800000.0,
    activeTransfersCount: 2,
    status: 'ACTIVE',
  },
];

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(BankNode)
    private bankRepo: Repository<BankNode>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private eventsGateway: EventsGateway,
    private fabricService: FabricService,
  ) {}

  async seedBanksIfEmpty() {
    const count = await this.bankRepo.count();
    if (count === 0) {
      this.logger.log('Seeding initial simulated bank nodes & liquidity...');
      for (const item of INITIAL_BANK_NODES) {
        const node = this.bankRepo.create(item);
        await this.bankRepo.save(node);
      }
    }
  }

  async getAllBanks(): Promise<BankNode[]> {
    await this.seedBanksIfEmpty();
    return this.bankRepo.find({ order: { code: 'ASC' } });
  }

  async getBankByCode(code: string): Promise<BankNode | null> {
    return this.bankRepo.findOne({ where: { code } });
  }

  /**
   * Simulates full interbank bilateral settlement and dual-ledger confirmation
   */
  async processSettlement(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const senderBank = await this.getBankByCode(payment.senderBank);
    const receiverBank = await this.getBankByCode(payment.receiverBank);

    if (!senderBank || !receiverBank) {
      throw new Error(`One or both banks (${payment.senderBank}, ${payment.receiverBank}) are not registered.`);
    }

    const prevState = payment.status;

    // 1. Mark Settlement Pending
    payment.status = PaymentStatus.SETTLEMENT_PENDING;
    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    // 2. Debit sender and Credit receiver simulated liquidity
    const debitAmount = Number(payment.amount);
    const creditAmount = Number(payment.targetAmount || payment.amount * payment.exchangeRate);

    senderBank.liquidityBalance = Number(senderBank.liquidityBalance) - debitAmount;
    receiverBank.liquidityBalance = Number(receiverBank.liquidityBalance) + creditAmount;
    senderBank.totalSettledVolume = Number(senderBank.totalSettledVolume) + debitAmount;
    receiverBank.totalSettledVolume = Number(receiverBank.totalSettledVolume) + creditAmount;

    await this.bankRepo.save(senderBank);
    await this.bankRepo.save(receiverBank);

    // 3. Generate settlement transaction reference
    const railName = payment.senderCountry === 'US' ? 'FEDWIRE' : payment.senderCountry === 'DE' ? 'TARGET2' : 'MEPS';
    const settlementTxRef = `SETTLE-${railName}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    payment.settlementTxRef = settlementTxRef;
    payment.status = PaymentStatus.SETTLED;
    payment.settledAt = new Date();

    // Commit to Fabric Ledger
    const ledgerResult = await this.fabricService.appendStateTransition({
      payment,
      action: 'TRANSITION_SETTLED',
      previousState: prevState,
      newState: PaymentStatus.SETTLED,
      actorOrg: 'Org2MSP',
      details: {
        settlementTxRef,
        senderBankDebited: `${payment.senderBank} -${payment.currency} ${debitAmount.toFixed(2)}`,
        receiverBankCredited: `${payment.receiverBank} +${payment.targetCurrency} ${creditAmount.toFixed(2)}`,
        simulatedRail: railName,
      },
    });

    payment.fabricTxId = ledgerResult.txId;
    payment.fabricBlockHash = ledgerResult.blockHash;
    payment.ledgerCommitted = true;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);
    this.eventsGateway.broadcast('banks.updated', await this.getAllBanks());

    return payment;
  }

  /**
   * Final step: Marks payment as fully reconciled
   */
  async reconcilePayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const prevState = payment.status;
    payment.status = PaymentStatus.RECONCILED;
    payment.reconciledAt = new Date();

    const ledgerResult = await this.fabricService.appendStateTransition({
      payment,
      action: 'RECONCILE_PAYMENT',
      previousState: prevState,
      newState: PaymentStatus.RECONCILED,
      actorOrg: 'Org3MSP',
      details: {
        reconciledAt: payment.reconciledAt.toISOString(),
        auditorConfirmation: 'Bilateral Nostro/Vostro account balances matched. Ledger state final.',
      },
    });

    payment.fabricTxId = ledgerResult.txId;
    payment.fabricBlockHash = ledgerResult.blockHash;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    return payment;
  }
}
