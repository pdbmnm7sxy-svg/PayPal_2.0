import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentStatus {
  DRAFT = 'DRAFT',
  RISK_CHECKED = 'RISK_CHECKED',
  RISK_HELD = 'RISK_HELD',
  FUNDING_ORDER_CREATED = 'FUNDING_ORDER_CREATED',
  FUNDED_PAYPAL = 'FUNDED_PAYPAL',
  FUNDED_SIMULATED = 'FUNDED_SIMULATED',
  ROUTED = 'ROUTED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  SETTLED = 'SETTLED',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
  RECONCILED = 'RECONCILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  reference: string;

  @Column()
  senderName: string;

  @Column()
  senderBank: string;

  @Column({ default: 'US' })
  senderCountry: string;

  @Column()
  receiverName: string;

  @Column()
  receiverBank: string;

  @Column({ default: 'DE' })
  receiverCountry: string;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'EUR' })
  targetCurrency: string;

  @Column('decimal', { precision: 10, scale: 4, default: 0.92 })
  exchangeRate: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  targetAmount: number;

  @Column({
    type: 'varchar',
    default: PaymentStatus.DRAFT,
  })
  status: PaymentStatus;

  // AI Fraud Model (LightGBM) fields
  @Column('decimal', { precision: 8, scale: 5, default: 0 })
  fraudScore: number;

  @Column({ default: 'LOW' })
  fraudRiskLevel: string;

  @Column({ default: 'APPROVE' })
  fraudDecision: string;

  @Column({ type: 'text', nullable: true })
  topFeaturesJson: string;

  @Column({ default: 'LEGIT_CLEAN' })
  benchmarkFixtureKey: string;

  // Compliance rules fields
  @Column({ default: 'CLEARED' })
  complianceStatus: string;

  @Column({ type: 'text', nullable: true })
  complianceFlagsJson: string;

  // PayPal Sandbox Fields
  @Column({ nullable: true })
  paypalOrderId: string;

  @Column({ nullable: true })
  paypalCaptureId: string;

  @Column({ nullable: true })
  paypalStatus: string;

  @Column({ default: 'PAYPAL_SANDBOX' })
  fundingMode: string;

  // Intelligent Routing Fields (Google OR-Tools)
  @Column({ type: 'text', nullable: true })
  selectedRouteJson: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  routeCostUSD: number;

  @Column({ default: 0 })
  estimatedMinutes: number;

  @Column({ type: 'text', nullable: true })
  routeReasoning: string;

  // Settlement and Ledger Fields
  @Column({ nullable: true })
  settlementTxRef: string;

  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ nullable: true })
  fabricTxId: string;

  @Column({ nullable: true })
  fabricBlockHash: string;

  @Column({ default: false })
  ledgerCommitted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
