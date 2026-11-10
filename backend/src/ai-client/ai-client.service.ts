import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface FraudScoreResult {
  fraud_probability: number;
  legitimate_probability: number;
  prediction: number;
  decision: string;
  risk_level: string;
  thresholds_applied: Record<string, number>;
  top_contributing_features: Array<{
    feature: string;
    value: number;
    significance: string;
    direction: string;
  }>;
  model_provenance: Record<string, string>;
  prototype_disclosure: string;
}

export interface ComplianceScreenResult {
  passed: boolean;
  status: string;
  risk_score: number;
  matches: Array<{
    rule_id: string;
    rule_name: string;
    severity: string;
    description: string;
    matched_value?: string;
  }>;
  audit_notes: string;
  prototype_disclosure: string;
}

export interface RouteOptimizationResult {
  optimal_route: {
    path: string[];
    hops: Array<{
      from_node: string;
      to_node: string;
      from_bank_name: string;
      to_bank_name: string;
      fixed_fee_usd: number;
      fx_spread_bps: number;
      fx_cost_usd: number;
      total_hop_cost_usd: number;
      estimated_minutes: number;
      settlement_channel: string;
      liquidity_available_usd: number;
    }>;
    total_cost_usd: number;
    total_estimated_minutes: number;
    is_optimal: boolean;
    selection_reason: string;
  };
  alternative_routes: Array<any>;
  solver_status: string;
  decision_summary: string;
  algorithm: string;
  assumptions: Record<string, any>;
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private aiServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async getHealth(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: 3000,
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async getModelInfo(): Promise<any> {
    const res = await axios.get(`${this.aiServiceUrl}/api/model/info`);
    return res.data;
  }

  async getBenchmarkFixtures(): Promise<any> {
    const res = await axios.get(`${this.aiServiceUrl}/api/benchmark/fixtures`);
    return res.data;
  }

  async scoreFraud(
    benchmarkFixtureKey: string,
    transferAmount: number,
    featureVector?: number[],
  ): Promise<FraudScoreResult> {
    try {
      const res = await axios.post(`${this.aiServiceUrl}/api/fraud/score`, {
        benchmark_fixture_key: benchmarkFixtureKey,
        transfer_amount: transferAmount,
        feature_vector: featureVector,
      });
      return res.data;
    } catch (error) {
      this.logger.error(`Error calling AI fraud service: ${error.message}`);
      throw error;
    }
  }

  async screenCompliance(params: {
    senderName: string;
    senderInstitution: string;
    senderCountry: string;
    receiverName: string;
    receiverInstitution: string;
    receiverCountry: string;
    amount: number;
    currency: string;
  }): Promise<ComplianceScreenResult> {
    try {
      const res = await axios.post(
        `${this.aiServiceUrl}/api/compliance/screen`,
        {
          sender_name: params.senderName,
          sender_institution: params.senderInstitution,
          sender_country: params.senderCountry,
          receiver_name: params.receiverName,
          receiver_institution: params.receiverInstitution,
          receiver_country: params.receiverCountry,
          amount: params.amount,
          currency: params.currency,
        },
      );
      return res.data;
    } catch (error) {
      this.logger.error(`Error calling compliance service: ${error.message}`);
      throw error;
    }
  }

  async optimizeRoute(params: {
    sourceBank: string;
    destinationBank: string;
    amount: number;
    currency: string;
    priority?: string;
  }): Promise<RouteOptimizationResult> {
    try {
      const res = await axios.post(
        `${this.aiServiceUrl}/api/routing/optimize`,
        {
          source_bank: params.sourceBank,
          destination_bank: params.destinationBank,
          amount: params.amount,
          currency: params.currency,
          priority: params.priority || 'BALANCED',
        },
      );
      return res.data;
    } catch (error) {
      this.logger.error(`Error calling OR-Tools routing service: ${error.message}`);
      throw error;
    }
  }
}
