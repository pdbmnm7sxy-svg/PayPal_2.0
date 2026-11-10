'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Network,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Building,
  ArrowRight,
  Clock,
  Layers,
  FileCheck,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Payment } from '../types';
import { api } from '../lib/api';
import PayPalButtonWrapper from './PayPalButtonWrapper';
import RouteVisualizer from './RouteVisualizer';

interface TransferDrawerProps {
  payment: Payment | null;
  onClose: () => void;
  onUpdate: (updated: Payment) => void;
}

export default function TransferDrawer({
  payment,
  onClose,
  onUpdate,
}: TransferDrawerProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!payment) return null;

  const topFeatures = payment.topFeaturesJson
    ? JSON.parse(payment.topFeaturesJson)
    : [];
  const complianceFlags = payment.complianceFlagsJson
    ? JSON.parse(payment.complianceFlagsJson)
    : [];
  const routeNodes = payment.selectedRouteJson
    ? JSON.parse(payment.selectedRouteJson)
    : [];

  const handleCommitRoute = async () => {
    try {
      setLoadingAction('commit-route');
      setErrorMsg(null);
      const res = await api.commitRoute(payment.id);
      onUpdate(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to commit route');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSettle = async () => {
    try {
      setLoadingAction('settle');
      setErrorMsg(null);
      const res = await api.settlePayment(payment.id);
      onUpdate(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Settlement failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReconcile = async () => {
    try {
      setLoadingAction('reconcile');
      setErrorMsg(null);
      const res = await api.reconcilePayment(payment.id);
      onUpdate(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Reconciliation failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const timelineSteps = [
    {
      num: 1,
      title: 'Transfer Initiation',
      status: 'COMPLETED',
      subtitle: `Drafted at ${new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      details: `${payment.currency} ${Number(payment.amount).toLocaleString()} via ${payment.senderBank}`,
      active: true,
      done: true,
    },
    {
      num: 2,
      title: 'AI Risk & Compliance',
      status: payment.status === 'DRAFT' ? 'PENDING' : payment.status === 'RISK_HELD' ? 'HELD' : 'CLEARED',
      subtitle: `Fraud Risk: ${(Number(payment.fraudScore) * 100).toFixed(2)}% (${payment.fraudRiskLevel})`,
      details: payment.complianceStatus === 'REJECTED' ? 'Watchlist match flagged' : 'Automated checks passed',
      active: payment.status !== 'DRAFT',
      done: payment.status !== 'DRAFT' && payment.status !== 'RISK_HELD',
    },
    {
      num: 3,
      title: 'Client Digital Funding',
      status:
        payment.paypalStatus === 'COMPLETED'
          ? 'FUNDED'
          : payment.status === 'RISK_HELD'
          ? 'BLOCKED'
          : payment.status === 'DRAFT' || payment.status === 'RISK_CHECKED'
          ? 'AWAITING'
          : 'COMPLETED',
      subtitle:
        payment.paypalOrderId
          ? `Order: ${payment.paypalOrderId}`
          : 'PayPal Sandbox or Demo Authorization',
      details: payment.fundingMode === 'PAYPAL_SANDBOX' ? 'PayPal Orders v2 Capture' : 'Simulated Client Funding',
      active:
        payment.status === 'FUNDING_ORDER_CREATED' ||
        payment.status === 'FUNDED_PAYPAL' ||
        payment.status === 'FUNDED_SIMULATED' ||
        payment.status === 'ROUTED' ||
        payment.status === 'SETTLEMENT_PENDING' ||
        payment.status === 'SETTLED' ||
        payment.status === 'RECONCILED',
      done:
        payment.status === 'FUNDED_PAYPAL' ||
        payment.status === 'FUNDED_SIMULATED' ||
        payment.status === 'ROUTED' ||
        payment.status === 'SETTLEMENT_PENDING' ||
        payment.status === 'SETTLED' ||
        payment.status === 'RECONCILED',
    },
    {
      num: 4,
      title: 'Fabric Consortium Audit',
      status: payment.ledgerCommitted ? 'COMMITTED' : 'PENDING',
      subtitle: payment.fabricBlockHash ? `Block: ${payment.fabricBlockHash.substring(0, 12)}...` : 'Uncommitted',
      details: 'Cryptographic SHA-256 state transition recorded',
      active: payment.ledgerCommitted,
      done: payment.ledgerCommitted,
    },
    {
      num: 5,
      title: 'OR-Tools Route Selection',
      status: payment.status === 'ROUTED' || payment.status === 'SETTLEMENT_PENDING' || payment.status === 'SETTLED' || payment.status === 'RECONCILED' ? 'ROUTED' : 'EVALUATING',
      subtitle: `${routeNodes.join(' → ')}`,
      details: `Est. transit: ~${payment.estimatedMinutes}m | Route fee: $${payment.routeCostUSD}`,
      active:
        payment.status === 'ROUTED' ||
        payment.status === 'SETTLEMENT_PENDING' ||
        payment.status === 'SETTLED' ||
        payment.status === 'RECONCILED',
      done:
        payment.status === 'SETTLEMENT_PENDING' ||
        payment.status === 'SETTLED' ||
        payment.status === 'RECONCILED',
    },
    {
      num: 6,
      title: 'Simulated Central Settlement',
      status:
        payment.status === 'RECONCILED'
          ? 'RECONCILED'
          : payment.status === 'SETTLED'
          ? 'SETTLED'
          : payment.status === 'SETTLEMENT_PENDING'
          ? 'PENDING'
          : 'AWAITING',
      subtitle: payment.settlementTxRef ? `Ref: ${payment.settlementTxRef}` : 'Interbank RTGS Settlement Rails',
      details: 'Simulated Fedwire / Target2 / MEPS+ bilateral clearing',
      active: payment.status === 'SETTLEMENT_PENDING' || payment.status === 'SETTLED' || payment.status === 'RECONCILED',
      done: payment.status === 'SETTLED' || payment.status === 'RECONCILED',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0d0f19] border-l border-white/10 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-violet-400">
                {payment.reference}
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                {payment.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {payment.currency} {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-2">
                → {payment.targetCurrency} {Number(payment.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} (FX @ {payment.exchangeRate})
              </span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{payment.senderName} ({payment.senderBank})</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>{payment.receiverName} ({payment.receiverBank})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: 6-Stage Lifecycle Progress Tracker */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lifecycle Progress Timeline
          </h3>
          <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-4">
            {timelineSteps.map((step, idx) => (
              <div key={step.num} className="flex items-start gap-3 relative">
                {idx !== timelineSteps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-8 -ml-[1px] ${
                      step.done ? 'bg-violet-500/60' : 'bg-white/[0.08]'
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    step.done
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : step.active
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {step.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        step.done
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : step.active
                          ? 'text-violet-300 bg-violet-500/15'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {step.subtitle}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {step.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Fraud Model & Compliance Detail */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hugging Face Model &amp; AML Screening
          </h3>
          <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#161829] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                  Fraud Probability
                </span>
                <span
                  className={`text-xl font-bold font-mono ${
                    payment.fraudRiskLevel === 'HIGH'
                      ? 'text-rose-400'
                      : payment.fraudRiskLevel === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(Number(payment.fraudScore) * 100).toFixed(3)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  LightGBM (bolewara/credit-card-fraud-detector)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#161829] border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                  AML Sanctions Status
                </span>
                <span
                  className={`text-xl font-bold ${
                    payment.complianceStatus === 'REJECTED'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {payment.complianceStatus}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Simulated OFAC Watchlist Rules
                </span>
              </div>
            </div>

            {topFeatures.length > 0 && (
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Top Anonymized PCA Feature Drivers:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {topFeatures.map((f: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#0e101a] border border-white/[0.04] text-[11px] font-mono flex items-center justify-between"
                    >
                      <span className="text-violet-300">{f.feature}</span>
                      <span className="text-slate-200">{Number(f.value).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500">{f.significance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complianceFlags.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                {complianceFlags.map((flag: any, i: number) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                    <span>
                      <strong>{flag.rule_name}</strong>: {flag.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Route Optimization & Visualizer */}
        {routeNodes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              OR-Tools Correspondent Route
            </h3>
            <RouteVisualizer
              nodes={routeNodes}
              costUSD={payment.routeCostUSD}
              estimatedMinutes={payment.estimatedMinutes}
              reasoning={payment.routeReasoning}
            />

            {payment.status === 'FUNDED_PAYPAL' || payment.status === 'FUNDED_SIMULATED' ? (
              <button
                onClick={handleCommitRoute}
                disabled={loadingAction === 'commit-route'}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              >
                <Network className="w-3.5 h-3.5" />
                <span>{loadingAction === 'commit-route' ? 'Committing...' : 'Commit Selected Corridor'}</span>
              </button>
            ) : null}
          </div>
        )}

        {/* Section 4: PayPal Sandbox Digital Client Funding Step */}
        {(payment.status === 'DRAFT' ||
          payment.status === 'RISK_CHECKED' ||
          payment.status === 'FUNDING_ORDER_CREATED') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Digital Client Funding
            </h3>
            <PayPalButtonWrapper
              paymentId={payment.id}
              amount={payment.amount}
              currency={payment.currency}
              onSuccess={(updated) => onUpdate(updated)}
              onError={(err) => setErrorMsg(typeof err === 'string' ? err : err.message || 'Payment error')}
            />
          </div>
        )}

        {/* Section 5: Interbank Central Bank Settlement (Simulated) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interbank Settlement Rails (Simulated)
          </h3>
          <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">RTGS Clearing Reference:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {payment.settlementTxRef || 'Pending Execution'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {payment.status === 'ROUTED' && (
                <button
                  onClick={handleSettle}
                  disabled={loadingAction === 'settle'}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-98"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{loadingAction === 'settle' ? 'Executing Settlement...' : 'Execute Interbank Settlement'}</span>
                </button>
              )}

              {payment.status === 'SETTLED' && (
                <button
                  onClick={handleReconcile}
                  disabled={loadingAction === 'reconcile'}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.25)] active:scale-98"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loadingAction === 'reconcile' ? 'Reconciling...' : 'Confirm Bilateral Reconciliation'}</span>
                </button>
              )}

              {payment.status === 'RECONCILED' && (
                <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transfer fully settled and reconciled across both financial institutions.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Hyperledger Fabric Ledger Certificate */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hyperledger Fabric Certificate
          </h3>
          <div className="p-4 rounded-2xl bg-[#121422] border border-white/[0.06] font-mono text-[11px] space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ledger State: </span>
              <span className={payment.ledgerCommitted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {payment.ledgerCommitted ? 'COMMITTED TO WORLD STATE' : 'PENDING'}
              </span>
            </div>
            {payment.fabricBlockHash && (
              <div className="truncate">
                <span className="text-slate-400">Block Hash: </span>
                <span className="text-violet-300">{payment.fabricBlockHash}</span>
              </div>
            )}
            {payment.fabricTxId && (
              <div className="truncate">
                <span className="text-slate-400">Fabric Tx ID: </span>
                <span className="text-slate-300">{payment.fabricTxId}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Channel: </span>
              <span className="text-slate-300">transnational-channel (Org1MSP, Org2MSP, Org3MSP)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
