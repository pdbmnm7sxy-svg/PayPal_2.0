export type PaymentStatus =
  | 'DRAFT'
  | 'RISK_CHECKED'
  | 'RISK_HELD'
  | 'FUNDING_ORDER_CREATED'
  | 'FUNDED_PAYPAL'
  | 'FUNDED_SIMULATED'
  | 'ROUTED'
  | 'SETTLEMENT_PENDING'
  | 'SETTLED'
  | 'SETTLEMENT_FAILED'
  | 'RECONCILED';

export interface Payment {
  id: string;
  reference: string;
  senderName: string;
  senderBank: string;
  senderCountry: string;
  receiverName: string;
  receiverBank: string;
  receiverCountry: string;
  amount: number;
  currency: string;
  targetCurrency: string;
  exchangeRate: number;
  targetAmount: number;
  status: PaymentStatus;
  fraudScore: number;
  fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudDecision: 'APPROVE' | 'MANUAL_REVIEW' | 'REJECT';
  topFeaturesJson?: string;
  benchmarkFixtureKey: string;
  complianceStatus: 'CLEARED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED';
  complianceFlagsJson?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalStatus?: string;
  fundingMode: 'PAYPAL_SANDBOX' | 'SIMULATED_DEMO';
  selectedRouteJson?: string;
  routeCostUSD: number;
  estimatedMinutes: number;
  routeReasoning?: string;
  settlementTxRef?: string;
  settledAt?: string;
  reconciledAt?: string;
  fabricTxId?: string;
  fabricBlockHash?: string;
  ledgerCommitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankNode {
  code: string;
  name: string;
  country: string;
  currency: string;
  liquidityBalance: number;
  initialLiquidity: number;
  totalSettledVolume: number;
  activeTransfersCount: number;
  status: string;
}

export interface FabricBlock {
  blockNumber: number;
  blockHash: string;
  prevBlockHash: string;
  channel: string;
  txId: string;
  timestamp: string;
  mspId: string;
  action: string;
  paymentId: string;
  paymentReference: string;
  payloadHash: string;
  details: Record<string, any>;
  signature: string;
}

export interface DashboardStats {
  totalTransfers: number;
  totalVolumeUSD: number;
  settledVolumeUSD: number;
  activeTransfersCount: number;
  heldTransfersCount: number;
  settledTransfersCount: number;
  fabricBlockCount: number;
  paypalConfigured: boolean;
}

export interface PayPalConfig {
  configured: boolean;
  environment: 'sandbox';
  clientIdMasked: string | null;
  message: string;
}
