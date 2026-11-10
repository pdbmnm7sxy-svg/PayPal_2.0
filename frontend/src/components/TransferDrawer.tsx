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
  FileText,
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

  const stages = [
    { key: 'DRAFT', label: 'Draft' },
    { key: 'RISK_CHECKED', label: 'Risk Screened' },
    { key: 'FUNDED', label: 'Funding Captured' },
    { key: 'ROUTED', label: 'Route Selected' },
    { key: 'SETTLED', label: 'Bank Settled' },
    { key: 'RECONCILED', label: 'Reconciled' },
  ];

  const getStageIndex = (status: string) => {
    if (status === 'DRAFT') return 0;
    if (status === 'RISK_CHECKED' || status === 'RISK_HELD') return 1;
    if (status === 'FUNDING_ORDER_CREATED') return 1;
    if (status === 'FUNDED_PAYPAL' || status === 'FUNDED_SIMULATED') return 2;
    if (status === 'ROUTED') return 3;
    if (status === 'SETTLEMENT_PENDING') return 3;
    if (status === 'SETTLED') return 4;
    if (status === 'RECONCILED') return 5;
    return 0;
  };

  const currentStageIdx = getStageIndex(payment.status);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                {payment.reference}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {new Date(payment.createdAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {payment.currency} {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} →{' '}
              {payment.targetCurrency} {Number(payment.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {payment.senderName} ({payment.senderBank}) → {payment.receiverName} ({payment.receiverBank})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pipeline Stage Tracker */}
        <div className="py-4 border-b border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Settlement Lifecycle Progress
          </div>
          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage.key} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-brand-500 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`truncate w-full ${
                      isPast ? 'text-emerald-400' : isCurrent ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 1: AI Fraud & Compliance Screening */}
        <div className="py-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>LightGBM Fraud Model & Compliance Screening</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                payment.fraudRiskLevel === 'HIGH'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : payment.fraudRiskLevel === 'MEDIUM'
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              }`}
            >
              {payment.fraudRiskLevel} Risk ({payment.fraudDecision})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Fraud Probability</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {(Number(payment.fraudScore) * 100).toFixed(3)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Model: <span className="text-slate-300 font-mono">bolewara/credit-card-fraud-detector</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Compliance Clearance</div>
              <div
                className={`text-sm font-bold font-mono mt-1 ${
                  payment.complianceStatus === 'CLEARED'
                    ? 'text-emerald-400'
                    : payment.complianceStatus === 'FLAGGED_FOR_REVIEW'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {payment.complianceStatus}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Sanctions & PEP: <span className="text-slate-300">Simulated Screen Complete</span>
              </div>
            </div>
          </div>

          {topFeatures.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Primary PCA Latent Feature Deviations:
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
                {topFeatures.map((f: any, i: number) => (
                  <div key={i} className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">{f.feature}</span>
                    <span className={f.value < 0 ? 'text-rose-400' : 'text-emerald-400'}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complianceFlags.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 text-xs space-y-1">
              <span className="text-[10px] font-semibold text-amber-300 uppercase block font-mono">
                Compliance Alert Flags:
              </span>
              {complianceFlags.map((flag: any, i: number) => (
                <div key={i} className="text-slate-300 text-[11px]">
                  • <span className="font-semibold text-amber-200">{flag.rule_name}:</span> {flag.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Google OR-Tools Intelligent Routing */}
        <div className="py-4 border-b border-slate-800">
          <RouteVisualizer
            routeNodes={routeNodes}
            totalCostUSD={Number(payment.routeCostUSD || 0)}
            estimatedMinutes={payment.estimatedMinutes || 0}
            reasoning={payment.routeReasoning}
          />

          {(payment.status === 'FUNDED_PAYPAL' || payment.status === 'FUNDED_SIMULATED') && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCommitRoute}
                disabled={loadingAction === 'commit-route'}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow"
              >
                <Network className="w-3.5 h-3.5" />
                <span>{loadingAction === 'commit-route' ? 'Committing...' : 'Commit Selected Route'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 3: PayPal Sandbox Funding Step */}
        <div className="py-4 border-b border-slate-800">
          <PayPalButtonWrapper
            payment={payment}
            onSuccess={(updated) => onUpdate(updated)}
            onError={(msg) => setErrorMsg(msg)}
          />
        </div>

        {/* Section 4: Bank Settlement & Dual Reconciliation Actions */}
        <div className="py-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Simulated Interbank Settlement Rails</span>
            </div>
            {payment.settlementTxRef && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                Ref: {payment.settlementTxRef}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {payment.status === 'ROUTED' && (
              <button
                onClick={handleSettle}
                disabled={loadingAction === 'settle'}
                className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loadingAction === 'settle' ? 'Executing Settlement...' : 'Execute Interbank Settlement'}</span>
              </button>
            )}

            {payment.status === 'SETTLED' && (
              <button
                onClick={handleReconcile}
                disabled={loadingAction === 'reconcile'}
                className="flex-1 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loadingAction === 'reconcile' ? 'Reconciling...' : 'Confirm Bilateral Reconciliation'}</span>
              </button>
            )}

            {payment.status === 'RECONCILED' && (
              <div className="w-full p-3 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Transfer fully settled and reconciled across both financial institutions.</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Hyperledger Fabric Ledger Certificate */}
        <div className="py-4 space-y-2">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Hyperledger Fabric Ledger Certificate</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 font-mono text-[11px] space-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-400">Ledger Status: </span>
              <span className={payment.ledgerCommitted ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {payment.ledgerCommitted ? 'COMMITTED TO WORLD STATE' : 'PENDING'}
              </span>
            </div>
            {payment.fabricBlockHash && (
              <div className="truncate">
                <span className="text-slate-400">Block Hash: </span>
                <span className="text-sky-300">{payment.fabricBlockHash}</span>
              </div>
            )}
            {payment.fabricTxId && (
              <div className="truncate">
                <span className="text-slate-400">Fabric Tx ID: </span>
                <span className="text-slate-300">{payment.fabricTxId}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Channel / Org: </span>
              <span className="text-slate-300">crossbridge-channel (Org1MSP, Org2MSP, Org3MSP)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
