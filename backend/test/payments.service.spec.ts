import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from '../src/payments/payments.service';
import { Payment, PaymentStatus } from '../src/entities/payment.entity';
import { AiClientService } from '../src/ai-client/ai-client.service';
import { PaypalService } from '../src/paypal/paypal.service';
import { FabricService } from '../src/fabric/fabric.service';
import { SettlementService } from '../src/settlement/settlement.service';
import { EventsGateway } from '../src/events/events.gateway';
import { AuditLog } from '../src/entities/audit-log.entity';

describe('PaymentsService Unit Tests', () => {
  let service: PaymentsService;
  let mockPaymentRepo: any;
  let mockAiClient: any;
  let mockPaypalService: any;
  let mockFabricService: any;
  let mockSettlementService: any;
  let mockEventsGateway: any;

  beforeEach(async () => {
    mockPaymentRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ ...dto, id: 'test-uuid-1234' })),
      save: jest.fn((p) => Promise.resolve(p)),
    };

    mockAiClient = {
      scoreFraud: jest.fn().mockResolvedValue({
        fraud_probability: 0.00012,
        risk_level: 'LOW',
        decision: 'APPROVE',
        top_contributing_features: [],
      }),
      screenCompliance: jest.fn().mockResolvedValue({
        status: 'CLEARED',
        passed: true,
        matches: [],
      }),
      optimizeRoute: jest.fn().mockResolvedValue({
        optimal_route: {
          path: ['GSB_US', 'INT_LDN', 'EUROT_DE'],
          total_cost_usd: 14.5,
          total_estimated_minutes: 35,
          selection_reason: 'Optimal route selected',
        },
      }),
    };

    mockPaypalService = {
      createOrder: jest.fn().mockResolvedValue({
        orderId: 'ORD-123',
        status: 'CREATED',
        approveUrl: 'https://sandbox.paypal.com/checkout?token=ORD-123',
      }),
      captureOrder: jest.fn().mockResolvedValue({
        captureId: 'CAP-123',
        orderId: 'ORD-123',
        status: 'COMPLETED',
        amount: '50000.00',
        currency: 'USD',
      }),
      simulateDemoFunding: jest.fn().mockReturnValue({
        captureId: 'SIM-CAP-123',
        orderId: 'SIM-ORD-123',
        status: 'SIMULATED_COMPLETED',
      }),
      getConfigStatus: jest.fn().mockReturnValue({ configured: true }),
    };

    mockFabricService = {
      appendStateTransition: jest.fn().mockResolvedValue({
        txId: 'FABRIC-TX-TEST',
        blockHash: 'abcdef1234567890',
        blockNumber: 1,
      }),
      getNetworkStatus: jest.fn().mockReturnValue({ totalBlocks: 5 }),
    };

    mockSettlementService = {
      processSettlement: jest.fn(),
      reconcilePayment: jest.fn(),
    };

    mockEventsGateway = {
      broadcast: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: AiClientService, useValue: mockAiClient },
        { provide: PaypalService, useValue: mockPaypalService },
        { provide: FabricService, useValue: mockFabricService },
        { provide: SettlementService, useValue: mockSettlementService },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should create payment and execute fraud, compliance, routing and fabric commit', async () => {
    const res = await service.create({
      senderName: 'Apex Capital',
      senderBank: 'GSB_US',
      receiverName: 'Bavaria Industrie',
      receiverBank: 'EUROT_DE',
      amount: 50000,
      currency: 'USD',
      targetCurrency: 'EUR',
      benchmarkFixtureKey: 'LEGIT_CLEAN',
    });

    expect(res).toBeDefined();
    expect(res.status).toBe(PaymentStatus.RISK_CHECKED);
    expect(mockAiClient.scoreFraud).toHaveBeenCalled();
    expect(mockAiClient.screenCompliance).toHaveBeenCalled();
    expect(mockAiClient.optimizeRoute).toHaveBeenCalled();
    expect(mockFabricService.appendStateTransition).toHaveBeenCalled();
    expect(mockEventsGateway.broadcast).toHaveBeenCalledWith('payment.created', expect.any(Object));
  });
});
