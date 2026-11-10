import { Payment, BankNode, FabricBlock, DashboardStats, PayPalConfig } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  getPayments: () => request<Payment[]>('/api/payments'),
  getPaymentById: (id: string) => request<Payment>(`/api/payments/${id}`),
  getPaymentStats: () => request<DashboardStats>('/api/payments/stats'),
  createPayment: (data: any) =>
    request<Payment>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createPayPalOrder: (paymentId: string) =>
    request<{ orderId: string; status: string; approveUrl?: string; paymentId: string }>(
      `/api/payments/${paymentId}/paypal/create-order`,
      { method: 'POST' },
    ),
  capturePayPalOrder: (paymentId: string, orderId: string) =>
    request<Payment>(`/api/payments/${paymentId}/paypal/capture-order`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),
  simulateFunding: (paymentId: string) =>
    request<Payment>(`/api/payments/${paymentId}/simulate-funding`, {
      method: 'POST',
    }),
  commitRoute: (paymentId: string) =>
    request<Payment>(`/api/payments/${paymentId}/commit-route`, {
      method: 'POST',
    }),
  settlePayment: (paymentId: string) =>
    request<Payment>(`/api/payments/${paymentId}/settle`, {
      method: 'POST',
    }),
  reconcilePayment: (paymentId: string) =>
    request<Payment>(`/api/payments/${paymentId}/reconcile`, {
      method: 'POST',
    }),
  getBanks: () => request<BankNode[]>('/api/banks'),
  getLedgerBlocks: (limit: number = 50) =>
    request<FabricBlock[]>(`/api/ledger/blocks?limit=${limit}`),
  getLedgerNetwork: () => request<any>('/api/ledger/network'),
  getPaymentLedger: (paymentId: string) =>
    request<FabricBlock[]>(`/api/payments/${paymentId}/ledger`),
  getPayPalConfig: () => request<PayPalConfig>('/api/paypal/config'),
  getPayPalClientId: () =>
    request<{ clientId: string | null; configured: boolean }>('/api/paypal/client-id'),
};
