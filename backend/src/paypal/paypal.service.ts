import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface PayPalConfigStatus {
  configured: boolean;
  environment: 'sandbox';
  clientIdMasked: string | null;
  message: string;
}

export interface PayPalOrderResponse {
  orderId: string;
  status: string;
  approveUrl?: string;
  isSimulated: boolean;
}

export interface PayPalCaptureResponse {
  captureId: string;
  orderId: string;
  status: string;
  amount: string;
  currency: string;
  isSimulated: boolean;
  completedAt: string;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('PAYPAL_CLIENT_SECRET') || '';
    this.baseUrl =
      this.configService.get<string>('PAYPAL_API_BASE') ||
      'https://api-m.sandbox.paypal.com';
  }

  isConfigured(): boolean {
    return (
      Boolean(this.clientId) &&
      Boolean(this.clientSecret) &&
      !this.clientId.includes('YOUR_PAYPAL') &&
      !this.clientSecret.includes('YOUR_PAYPAL')
    );
  }

  getConfigStatus(): PayPalConfigStatus {
    const configured = this.isConfigured();
    return {
      configured,
      environment: 'sandbox',
      clientIdMasked: configured
        ? `${this.clientId.substring(0, 6)}...${this.clientId.slice(-4)}`
        : null,
      message: configured
        ? 'PayPal Sandbox is configured and active for live funding verification.'
        : 'PayPal Sandbox credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) are missing or set to placeholder in .env. Real sandbox checkout requires setting these credentials. A clearly labeled Demo Simulated Funding mode is available for offline testing.',
    };
  }

  getClientIdForFrontend(): { clientId: string | null; configured: boolean } {
    return {
      clientId: this.isConfigured() ? this.clientId : null,
      configured: this.isConfigured(),
    };
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new HttpException(
        {
          error: 'PAYPAL_UNCONFIGURED',
          message:
            'PayPal Sandbox credentials are not configured in environment variables. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable live sandbox checkout.',
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now + 60000) {
      return this.cachedToken;
    }

    try {
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = now + response.data.expires_in * 1000;
      return this.cachedToken;
    } catch (error) {
      this.logger.error(
        `Failed to obtain PayPal Sandbox OAuth token: ${error.response?.data?.error_description || error.message}`,
      );
      throw new BadRequestException(
        `PayPal OAuth Authentication failed: ${error.response?.data?.error_description || error.message}`,
      );
    }
  }

  /**
   * Creates an Order on PayPal Sandbox via server-side Orders v2 API
   */
  async createOrder(
    reference: string,
    amount: number,
    currency: string = 'USD',
  ): Promise<PayPalOrderResponse> {
    if (!this.isConfigured()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PRECONDITION_FAILED,
          error: 'PAYPAL_UNCONFIGURED',
          message:
            'PayPal Sandbox is not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in backend/.env or use simulated demo funding mode.',
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const token = await this.getAccessToken();

    try {
      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: reference,
            description: `Transnational Prototype Funding Verification - ${reference}`,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Transnational',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'https://example.com/checkout/success',
          cancel_url: 'https://example.com/checkout/cancel',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const orderData = response.data;
      const approveLink = orderData.links?.find(
        (l: any) => l.rel === 'approve',
      )?.href;

      return {
        orderId: orderData.id,
        status: orderData.status,
        approveUrl: approveLink,
        isSimulated: false,
      };
    } catch (error) {
      this.logger.error(
        `PayPal create order failed: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new BadRequestException(
        `PayPal Sandbox Order Creation Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Captures payment for an approved PayPal Sandbox Order
   */
  async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    if (!this.isConfigured()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PRECONDITION_FAILED,
          error: 'PAYPAL_UNCONFIGURED',
          message:
            'PayPal Sandbox is not configured. Cannot capture real sandbox order.',
        },
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 12000,
        },
      );

      const captureData = response.data;
      const captureDetails =
        captureData.purchase_units?.[0]?.payments?.captures?.[0];

      if (!captureDetails || captureDetails.status !== 'COMPLETED') {
        throw new BadRequestException(
          `PayPal Capture incomplete: Status is ${captureDetails?.status || captureData.status}`,
        );
      }

      return {
        captureId: captureDetails.id,
        orderId: captureData.id,
        status: captureDetails.status,
        amount: captureDetails.amount?.value,
        currency: captureDetails.amount?.currency_code,
        isSimulated: false,
        completedAt:
          captureDetails.create_time || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `PayPal capture order failed: ${JSON.stringify(error.response?.data || error.message)}`,
      );
      throw new BadRequestException(
        `PayPal Sandbox Order Capture Error: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Clearly identified demo-only funding simulation when credentials are absent
   */
  simulateDemoFunding(
    reference: string,
    amount: number,
    currency: string = 'USD',
  ): PayPalCaptureResponse {
    const timestamp = Date.now();
    return {
      captureId: `SIM-CAPT-${timestamp.toString(36).toUpperCase()}`,
      orderId: `SIM-ORD-${timestamp.toString(36).toUpperCase()}`,
      status: 'SIMULATED_COMPLETED',
      amount: amount.toFixed(2),
      currency: currency,
      isSimulated: true,
      completedAt: new Date().toISOString(),
    };
  }
}
