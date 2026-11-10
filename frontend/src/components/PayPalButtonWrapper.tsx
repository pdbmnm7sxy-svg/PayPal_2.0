'use client';

import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';

interface PayPalButtonWrapperProps {
  paymentId: string;
  amount: string | number;
  currency: string;
  onSuccess: (payment: any) => void;
  onError: (err: any) => void;
}

export default function PayPalButtonWrapper({
  paymentId,
  amount,
  currency,
  onSuccess,
  onError,
}: PayPalButtonWrapperProps) {
  const [clientId, setClientId] = useState<string>('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api
      .getPayPalClientId()
      .then((cfg) => {
        setConfigured(cfg.configured);
        setClientId(cfg.clientId || '');
      })
      .catch((e) => {
        console.error('Failed to get PayPal config:', e);
        setConfigured(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSimulatePayment = async () => {
    try {
      setSimulating(true);
      const res = await api.simulateFunding(paymentId);
      onSuccess(res);
    } catch (e: any) {
      onError(e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-[#141726] border border-white/[0.08] text-center text-xs text-slate-400">
        Checking PayPal Developer Sandbox authorization status...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {configured && clientId ? (
        <div className="p-5 rounded-2xl bg-[#141726] border border-white/[0.08] shadow-card-dark">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white tracking-tight">
                PayPal Developer Sandbox Checkout
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Authorized client funding demonstration. Order creation and capture execute server-side via NestJS calling PayPal Orders v2 APIs.
          </p>

          <PayPalScriptProvider
            options={{
              clientId: clientId,
              currency: currency === 'SGD' ? 'SGD' : currency === 'EUR' ? 'EUR' : 'USD',
              intent: 'capture',
            }}
          >
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay',
                height: 42,
              }}
              createOrder={async () => {
                const res = await api.createPayPalOrder(paymentId);
                return res.orderId;
              }}
              onApprove={async (data) => {
                const res = await api.capturePayPalOrder(paymentId, data.orderID);
                onSuccess(res);
              }}
              onError={(err) => {
                console.error('PayPal checkout error:', err);
                onError(err);
              }}
            />
          </PayPalScriptProvider>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#141726] border border-white/[0.08] shadow-card-dark space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-tight block">
                  PayPal Sandbox Not Configured
                </span>
                <span className="text-[11px] text-slate-400">
                  Missing PAYPAL_CLIENT_ID &amp; PAYPAL_CLIENT_SECRET
                </span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Demo Fallback Mode
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            To enable real PayPal checkout, add your credentials from the{' '}
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 underline font-medium hover:text-violet-300"
            >
              PayPal Developer Dashboard
            </a>{' '}
            to your local `.env` file. In the meantime, you can test the downstream blockchain and simulated settlement workflow with demo client funding.
          </p>

          <button
            onClick={handleSimulatePayment}
            disabled={simulating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.25)] active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {simulating
                ? 'Processing Simulated Client Funding...'
                : 'Confirm with Simulated Demo Funding'}
            </span>
          </button>
        </div>
      )}

      {/* Strict prototype notice footer */}
      <div className="p-3 rounded-xl bg-[#0e101a] border border-white/[0.04] flex items-center gap-2 text-[11px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span>
          Funding authorization demonstrates payment initiation; it is distinct from and precedes correspondent bank settlement.
        </span>
      </div>
    </div>
  );
}
