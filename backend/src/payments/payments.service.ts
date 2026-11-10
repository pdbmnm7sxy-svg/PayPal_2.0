import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AiClientService } from '../ai-client/ai-client.service';
import { PaypalService } from '../paypal/paypal.service';
import { FabricService } from '../fabric/fabric.service';
import { SettlementService } from '../settlement/settlement.service';
import { EventsGateway } from '../events/events.gateway';

const EXCHANGE_RATES: Record<string, number> = {
  'USD-EUR': 0.92,
  'EUR-USD': 1.087,
  'USD-SGD': 1.345,
  'SGD-USD': 0.743,
  'EUR-SGD': 1.462,
  'SGD-EUR': 0.684,
  'USD-USD': 1.0,
  'EUR-EUR': 1.0,
  'SGD-SGD': 1.0,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private aiClient: AiClientService,
    private paypalService: PaypalService,
    private fabricService: FabricService,
    private settlementService: SettlementService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: [{ id }, { reference: id }],
    });
    if (!payment) {
      throw new NotFoundException(`Payment record '${id}' not found`);
    }
    return payment;
  }

  /**
   * Core payment initiation workflow:
   * 1. Calculates FX rates
   * 2. Runs LightGBM fraud model on 29-feature benchmark schema
   * 3. Runs demo-only sanctions/PEP/AML screening
   * 4. Runs Google OR-Tools routing optimization
   * 5. Persists payment & records initial block on Fabric
   */
  async create(dto: CreatePaymentDto): Promise<Payment> {
    const rateKey = `${dto.currency}-${dto.targetCurrency}`;
    const exchangeRate = EXCHANGE_RATES[rateKey] || 1.0;
    const targetAmount = Number((dto.amount * exchangeRate).toFixed(2));

    const senderCountry = dto.senderCountry || (dto.senderBank === 'GSB_US' ? 'US' : dto.senderBank === 'EUROT_DE' ? 'DE' : 'SG');
    const receiverCountry = dto.receiverCountry || (dto.receiverBank === 'EUROT_DE' ? 'DE' : dto.receiverBank === 'PACIFIC_SG' ? 'SG' : 'US');

    const timestampCode = Date.now().toString(36).toUpperCase().slice(-5);
    const reference = `TX-2026-${dto.currency}-${dto.targetCurrency}-${timestampCode}`;

    // 1. Run LightGBM Fraud scoring
    const fixtureKey = dto.benchmarkFixtureKey || 'LEGIT_CLEAN';
    const fraudResult = await this.aiClient.scoreFraud(fixtureKey, dto.amount);

    // 2. Run Compliance Screening
    const complianceResult = await this.aiClient.screenCompliance({
      senderName: dto.senderName,
      senderInstitution: dto.senderBank,
      senderCountry,
      receiverName: dto.receiverName,
      receiverInstitution: dto.receiverBank,
      receiverCountry,
      amount: dto.amount,
      currency: dto.currency,
    });

    // 3. Run Google OR-Tools Route Optimization
    const routingResult = await this.aiClient.optimizeRoute({
      sourceBank: dto.senderBank,
      destinationBank: dto.receiverBank,
      amount: dto.amount,
      currency: dto.currency,
      priority: dto.routingPriority || 'BALANCED',
    });

    // Determine initial status based on screening
    let initialStatus = PaymentStatus.RISK_CHECKED;
    if (
      fraudResult.decision === 'REJECT' ||
      complianceResult.status === 'REJECTED'
    ) {
      initialStatus = PaymentStatus.RISK_HELD;
    }

    const payment = this.paymentRepo.create({
      reference,
      senderName: dto.senderName,
      senderBank: dto.senderBank,
      senderCountry,
      receiverName: dto.receiverName,
      receiverBank: dto.receiverBank,
      receiverCountry,
      amount: dto.amount,
      currency: dto.currency,
      targetCurrency: dto.targetCurrency,
      exchangeRate,
      targetAmount,
      status: initialStatus,
      fraudScore: fraudResult.fraud_probability,
      fraudRiskLevel: fraudResult.risk_level,
      fraudDecision: fraudResult.decision,
      topFeaturesJson: JSON.stringify(fraudResult.top_contributing_features),
      benchmarkFixtureKey: fixtureKey,
      complianceStatus: complianceResult.status,
      complianceFlagsJson: JSON.stringify(complianceResult.matches),
      selectedRouteJson: JSON.stringify(routingResult.optimal_route.path),
      routeCostUSD: routingResult.optimal_route.total_cost_usd,
      estimatedMinutes: routingResult.optimal_route.total_estimated_minutes,
      routeReasoning: routingResult.optimal_route.selection_reason,
    });

    const saved = await this.paymentRepo.save(payment);

    // Commit to Fabric Ledger
    const ledgerResult = await this.fabricService.appendStateTransition({
      payment: saved,
      action: 'INITIATE_PAYMENT',
      previousState: 'NONE',
      newState: initialStatus,
      actorOrg: 'Org1MSP',
      details: {
        fraudProbability: fraudResult.fraud_probability,
        complianceStatus: complianceResult.status,
        optimalRoute: routingResult.optimal_route.path,
        estimatedCostUSD: routingResult.optimal_route.total_cost_usd,
      },
    });

    saved.fabricTxId = ledgerResult.txId;
    saved.fabricBlockHash = ledgerResult.blockHash;
    saved.ledgerCommitted = true;

    await this.paymentRepo.save(saved);
    this.eventsGateway.broadcast('payment.created', saved);

    return saved;
  }

  /**
   * Creates a PayPal Sandbox Order for the payment funding step
   */
  async createPayPalOrder(paymentId: string) {
    const payment = await this.findOne(paymentId);
    if (payment.status === PaymentStatus.RISK_HELD) {
      throw new BadRequestException('Cannot initiate funding: Transaction is held for risk / compliance violations.');
    }

    const orderRes = await this.paypalService.createOrder(
      payment.reference,
      Number(payment.amount),
      payment.currency,
    );

    payment.paypalOrderId = orderRes.orderId;
    payment.paypalStatus = orderRes.status;
    payment.status = PaymentStatus.FUNDING_ORDER_CREATED;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    return {
      orderId: orderRes.orderId,
      status: orderRes.status,
      approveUrl: orderRes.approveUrl,
      paymentId: payment.id,
    };
  }

  /**
   * Captures an approved PayPal Sandbox Order
   */
  async capturePayPalOrder(paymentId: string, orderId: string) {
    const payment = await this.findOne(paymentId);

    // Idempotency check: avoid double captures
    if (payment.status === PaymentStatus.FUNDED_PAYPAL && payment.paypalCaptureId) {
      return payment;
    }

    const captureRes = await this.paypalService.captureOrder(orderId);

    const prevState = payment.status;
    payment.paypalCaptureId = captureRes.captureId;
    payment.paypalOrderId = captureRes.orderId;
    payment.paypalStatus = captureRes.status;
    payment.status = PaymentStatus.FUNDED_PAYPAL;
    payment.fundingMode = 'PAYPAL_SANDBOX';

    // Commit to Fabric Ledger
    const ledgerResult = await this.fabricService.appendStateTransition({
      payment,
      action: 'RECORD_FUNDING_CAPTURE',
      previousState: prevState,
      newState: PaymentStatus.FUNDED_PAYPAL,
      actorOrg: 'Org1MSP',
      details: {
        paypalOrderId: captureRes.orderId,
        paypalCaptureId: captureRes.captureId,
        amount: captureRes.amount,
        currency: captureRes.currency,
      },
    });

    payment.fabricTxId = ledgerResult.txId;
    payment.fabricBlockHash = ledgerResult.blockHash;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    return payment;
  }

  /**
   * Clearly labeled demo funding simulation when sandbox keys are not supplied
   */
  async simulateDemoFunding(paymentId: string) {
    const payment = await this.findOne(paymentId);

    const simRes = this.paypalService.simulateDemoFunding(
      payment.reference,
      Number(payment.amount),
      payment.currency,
    );

    const prevState = payment.status;
    payment.paypalOrderId = simRes.orderId;
    payment.paypalCaptureId = simRes.captureId;
    payment.paypalStatus = simRes.status;
    payment.status = PaymentStatus.FUNDED_SIMULATED;
    payment.fundingMode = 'SIMULATED_DEMO';

    const ledgerResult = await this.fabricService.appendStateTransition({
      payment,
      action: 'RECORD_SIMULATED_FUNDING',
      previousState: prevState,
      newState: PaymentStatus.FUNDED_SIMULATED,
      actorOrg: 'Org1MSP',
      details: {
        simulatedOrderId: simRes.orderId,
        simulatedCaptureId: simRes.captureId,
        fundingMode: 'SIMULATED_DEMO',
        notice: 'Demonstration funding bypass. Real PayPal Sandbox credentials not configured in environment.',
      },
    });

    payment.fabricTxId = ledgerResult.txId;
    payment.fabricBlockHash = ledgerResult.blockHash;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    return payment;
  }

  /**
   * Commits the selected route to the ledger and transitions state to ROUTED
   */
  async commitRoute(paymentId: string) {
    const payment = await this.findOne(paymentId);
    const prevState = payment.status;
    payment.status = PaymentStatus.ROUTED;

    const ledgerResult = await this.fabricService.appendStateTransition({
      payment,
      action: 'COMMIT_OPTIMAL_ROUTE',
      previousState: prevState,
      newState: PaymentStatus.ROUTED,
      actorOrg: 'Org1MSP',
      details: {
        route: payment.selectedRouteJson ? JSON.parse(payment.selectedRouteJson) : [],
        routeCostUSD: payment.routeCostUSD,
        estimatedMinutes: payment.estimatedMinutes,
      },
    });

    payment.fabricTxId = ledgerResult.txId;
    payment.fabricBlockHash = ledgerResult.blockHash;

    await this.paymentRepo.save(payment);
    this.eventsGateway.broadcast('payment.updated', payment);

    return payment;
  }

  /**
   * Executes interbank settlement through simulated banks
   */
  async processSettlement(paymentId: string) {
    return this.settlementService.processSettlement(paymentId);
  }

  /**
   * Reconciles the payment as final
   */
  async reconcilePayment(paymentId: string) {
    return this.settlementService.reconcilePayment(paymentId);
  }

  /**
   * Computes operational metrics for dashboard summary cards
   */
  async getStats() {
    const all = await this.paymentRepo.find();
    const totalVolume = all.reduce((sum, p) => sum + Number(p.amount), 0);
    const settledVolume = all
      .filter((p) => p.status === PaymentStatus.SETTLED || p.status === PaymentStatus.RECONCILED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const activeCount = all.filter(
      (p) =>
        p.status !== PaymentStatus.SETTLED &&
        p.status !== PaymentStatus.RECONCILED &&
        p.status !== PaymentStatus.RISK_HELD &&
        p.status !== PaymentStatus.SETTLEMENT_FAILED,
    ).length;

    const heldCount = all.filter(
      (p) => p.status === PaymentStatus.RISK_HELD || p.status === PaymentStatus.SETTLEMENT_FAILED,
    ).length;

    const settledCount = all.filter(
      (p) => p.status === PaymentStatus.SETTLED || p.status === PaymentStatus.RECONCILED,
    ).length;

    const networkStatus = this.fabricService.getNetworkStatus();
    const paypalConfig = this.paypalService.getConfigStatus();

    return {
      totalTransfers: all.length,
      totalVolumeUSD: totalVolume,
      settledVolumeUSD: settledVolume,
      activeTransfersCount: activeCount,
      heldTransfersCount: heldCount,
      settledTransfersCount: settledCount,
      fabricBlockCount: networkStatus.totalBlocks,
      paypalConfigured: paypalConfig.configured,
    };
  }
}
