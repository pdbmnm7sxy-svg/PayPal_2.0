'use client';

import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { api } from '../lib/api';
import { Payment } from '../types';

interface PayPalButtonWrapperProps {
  payment: Payment;
  onSuccess: (payment: Payment) => void;
  onError: (error: string) => void;
}

export default function PayPalButtonWrapper({
  payment,
  onSuccess,
  onError,
}: PayPalButtonWrapperProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    api
      .getPayPalClientId()
      .then((res) => {
        setClientId(res.clientId);
        setIsConfigured(res.configured);
      })
      .catch(() => {
        setIsConfigured(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSimulatedFunding = async () => {
    try {
      setSimulating(true);
      const updated = await api.simulateFunding(payment.id);
      onSuccess(updated);
    } catch (err: any) {
      onError(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-xs text-slate-500">
        Checking PayPal Sandbox authorization gateway...
      </div>
    );
  }

  // If already funded
  if (payment.status === 'FUNDED_PAYPAL' || payment.status === 'FUNDED_SIMULATED' || payment.paypalCaptureId) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
        <div className="flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Institutional Pre-Funding Captured & Verified</span>
        </div>
        <div className="mt-2 text-xs space-y-1 text-slate-700">
          <div>Funding Verification: <span className="font-semibold text-slate-900">{payment.fundingMode}</span></div>
          {payment.paypalOrderId && <div>PayPal Order ID: <span className="font-mono text-slate-800">{payment.paypalOrderId}</span></div>}
          {payment.paypalCaptureId && <div>PayPal Capture ID: <span className="font-mono text-emerald-700 font-bold">{payment.paypalCaptureId}</span></div>}
        </div>
      </div>
    );
  }

  // If real PayPal Sandbox credentials are not configured in environment
  if (!isConfigured || !clientId) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 block">
              PayPal Developer Sandbox Keys Unconfigured
            </span>
            <p className="text-amber-800 mt-1 leading-relaxed">
              Real PayPal Sandbox checkout requires <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PAYPAL_CLIENT_ID</code> and{' '}
              <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PAYPAL_CLIENT_SECRET</code> in the backend environment.
            </p>
          </div>
        </div>

        <div className="pt-2.5 border-t border-amber-200/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-amber-800">
            Click below to execute a simulated funding verification:
          </div>
          <button
            onClick={handleSimulatedFunding}
            disabled={simulating}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0070e0] hover:bg-[#005cb8] text-white flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simulating ? 'Simulating...' : 'Execute Demo Funding'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Real PayPal Sandbox Checkout
  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">
          PayPal Sandbox Institutional Checkout
        </span>
        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Sandbox Connected
        </span>
      </div>

      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'pill', color: 'blue', label: 'pay' }}
          createOrder={async () => {
            try {
              const res = await api.createPayPalOrder(payment.id);
              return res.orderId;
            } catch (err: any) {
              onError(err.message || 'Failed to initialize PayPal Order');
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const updated = await api.capturePayPalOrder(payment.id, data.orderID);
              onSuccess(updated);
            } catch (err: any) {
              onError(err.message || 'Failed to capture PayPal Order');
            }
          }}
          onError={(err: any) => {
            onError(err?.message || 'PayPal Checkout encounter an error');
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
