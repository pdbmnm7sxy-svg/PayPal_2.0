'use client';

import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { AlertCircle, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
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
      <div className="py-4 text-center text-xs font-mono text-slate-400">
        Checking PayPal Sandbox authentication status...
      </div>
    );
  }

  // If already funded
  if (payment.status === 'FUNDED_PAYPAL' || payment.status === 'FUNDED_SIMULATED' || payment.paypalCaptureId) {
    return (
      <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
        <div className="flex items-center gap-2 font-semibold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Institutional Pre-Funding Captured & Verified</span>
        </div>
        <div className="mt-2 font-mono text-[11px] space-y-1 text-slate-300">
          <div>Mode: <span className="text-white font-semibold">{payment.fundingMode}</span></div>
          <div>PayPal Order ID: <span className="text-white">{payment.paypalOrderId || 'N/A'}</span></div>
          <div>PayPal Capture ID: <span className="text-emerald-400 font-semibold">{payment.paypalCaptureId || 'N/A'}</span></div>
        </div>
      </div>
    );
  }

  // If real PayPal Sandbox credentials are not configured in environment
  if (!isConfigured || !clientId) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40 space-y-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-300 block">
              PayPal Sandbox Not Configured
            </span>
            <p className="text-slate-300 mt-1 leading-relaxed">
              Real PayPal Sandbox checkout requires <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">PAYPAL_CLIENT_ID</code> and{' '}
              <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">PAYPAL_CLIENT_SECRET</code> in the backend environment.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Click below to execute a simulated funding bypass for testing:
          </div>
          <button
            onClick={handleSimulatedFunding}
            disabled={simulating}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors shadow"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simulating ? 'Simulating...' : 'Demo Simulated Funding'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Real PayPal Sandbox Checkout Button
  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>PayPal Sandbox Funding Verification</span>
        </div>
        <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
          Sandbox Active
        </span>
      </div>

      <PayPalScriptProvider
        options={{
          clientId: clientId,
          currency: payment.currency || 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 38,
          }}
          createOrder={async () => {
            try {
              const res = await api.createPayPalOrder(payment.id);
              return res.orderId;
            } catch (err: any) {
              onError(err.message || 'Failed to create PayPal Sandbox order');
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const updated = await api.capturePayPalOrder(payment.id, data.orderID);
              onSuccess(updated);
            } catch (err: any) {
              onError(err.message || 'PayPal capture failed');
            }
          }}
          onError={(err: any) => {
            onError(`PayPal SDK Error: ${err.message || 'Sandbox error'}`);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
