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
      status: payment.complianceStatus === 'CLEARED' ? 'CLEARED' : payment.complianceStatus,
      subtitle: `Fraud Score ${(Number(payment.fraudScore) * 100).toFixed(2)}% (${payment.fraudDecision})`,
      details: 'LightGBM 29-PCA Model & Rules Engine',
      active: true,
      done: payment.fraudDecision === 'APPROVE',
      isError: payment.fraudRiskLevel === 'HIGH',
    },
    {
      num: 3,
      title: 'Digital Funding Verification',
      status: payment.paypalCaptureId
        ? 'PAYPAL CAPTURED'
        : payment.status.includes('FUNDED')
        ? 'FUNDED'
        : 'AWAITING FUNDING',
      subtitle: payment.paypalOrderId ? `PayPal Order: ${payment.paypalOrderId}` : 'Digital Sandbox Verification',
      details: payment.status.includes('FUNDED') ? 'Liquidity verified' : 'Requires client authorization',
      active: payment.status !== 'DRAFT',
      done: payment.status.includes('FUNDED') || payment.status === 'ROUTED' || payment.status === 'SETTLED' || payment.status === 'RECONCILED',
    },
    {
      num: 4,
      title: 'Fabric Consortium Ledger',
      status: payment.ledgerCommitted ? 'COMMITTED' : 'PENDING',
      subtitle: payment.fabricBlockHash ? `Block: ${payment.fabricBlockHash.substring(0, 10)}...` : 'Consortium State Transition',
      details: 'Org1MSP, Org2MSP, Org3MSP consensus',
      active: payment.status.includes('FUNDED') || payment.ledgerCommitted,
      done: payment.ledgerCommitted,
    },
    {
      num: 5,
      title: 'OR-Tools Route Selection',
      status: payment.status === 'ROUTED' || payment.status === 'SETTLED' || payment.status === 'RECONCILED' ? 'COMMITTED' : 'CALCULATED',
      subtitle: `Cost: $${Number(payment.routeCostUSD || 0).toFixed(2)} • ETA: ${payment.estimatedMinutes || 45}m`,
      details: routeNodes.length > 0 ? `${routeNodes.join(' → ')}` : 'Optimal corridor chosen',
      active: payment.status.includes('FUNDED') || payment.status === 'ROUTED',
      done: payment.status === 'ROUTED' || payment.status === 'SETTLED' || payment.status === 'RECONCILED',
    },
    {
      num: 6,
      title: 'Interbank RTGS Settlement',
      status: payment.status === 'RECONCILED' ? 'RECONCILED' : payment.status === 'SETTLED' ? 'SETTLED' : 'PENDING SETTLEMENT',
      subtitle: payment.settlementTxRef ? `Ref: ${payment.settlementTxRef}` : 'Bilateral Nostro/Vostro Movement',
      details: payment.status === 'RECONCILED' ? 'Fully Reconciled' : 'Central bank settlement simulation',
      active: payment.status === 'ROUTED' || payment.status === 'SETTLED' || payment.status === 'RECONCILED',
      done: payment.status === 'SETTLED' || payment.status === 'RECONCILED',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0070e0] font-semibold border border-blue-200">
                {payment.reference}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                {new Date(payment.createdAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {payment.currency} {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} →{' '}
              {payment.targetCurrency} {Number(payment.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{payment.senderName}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{payment.senderBank}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-700">{payment.receiverName}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{payment.receiverBank}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step-by-Step Interactive Timeline (Screen 4 Requirement) */}
        <div className="py-5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0070e0]" />
            <span>Settlement Lifecycle Timeline</span>
          </h3>

          <div className="space-y-4">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px ${
                      step.done ? 'bg-emerald-300' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition-colors ${
                    step.done
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : step.isError
                      ? 'bg-rose-500 text-white shadow-xs'
                      : step.active
                      ? 'bg-[#0070e0] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {step.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        step.done
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : step.isError
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {step.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: AI Fraud & Compliance Screening */}
        <div className="py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Machine Learning Risk & Sanctions Clearance</span>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                payment.fraudRiskLevel === 'HIGH'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : payment.fraudRiskLevel === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {payment.fraudRiskLevel} Risk ({payment.fraudDecision})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Fraud Probability</div>
              <div className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {(Number(payment.fraudScore) * 100).toFixed(3)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Model: <span className="font-mono text-slate-700 text-[10px]">bolewara/credit-card-fraud-detector</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">KYC/AML Status</div>
              <div
                className={`text-sm font-bold mt-1 ${
                  payment.complianceStatus === 'CLEARED'
                    ? 'text-emerald-700'
                    : payment.complianceStatus === 'FLAGGED_FOR_REVIEW'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {payment.complianceStatus}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                OFAC Sanctions & PEP: <span className="text-slate-700">Simulated Screen Passed</span>
              </div>
            </div>
          </div>

          {topFeatures.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Primary PCA Latent Feature Deviations (Synthetic Benchmark):
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
                {topFeatures.map((f: any, i: number) => (
                  <div key={i} className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[9px]">{f.feature}</span>
                    <span className={f.value < 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complianceFlags.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                Compliance Review Flags:
              </span>
              {complianceFlags.map((flag: any, i: number) => (
                <div key={i} className="text-amber-900 text-xs">
                  • <span className="font-semibold">{flag.rule_name}:</span> {flag.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Google OR-Tools Intelligent Routing */}
        <div className="py-4 border-b border-slate-100">
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
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0070e0] hover:bg-[#005cb8] text-white flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Network className="w-3.5 h-3.5" />
                <span>{loadingAction === 'commit-route' ? 'Committing...' : 'Commit Selected Corridor'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 3: PayPal Sandbox Funding Step */}
        <div className="py-4 border-b border-slate-100">
          <PayPalButtonWrapper
            payment={payment}
            onSuccess={(updated) => onUpdate(updated)}
            onError={(msg) => setErrorMsg(msg)}
          />
        </div>

        {/* Section 4: Bank Settlement & Reconciliation Actions */}
        <div className="py-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Interbank Central Bank Settlement (Simulated)</span>
            </div>
            {payment.settlementTxRef && (
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                Ref: {payment.settlementTxRef}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {payment.status === 'ROUTED' && (
              <button
                onClick={handleSettle}
                disabled={loadingAction === 'settle'}
                className="flex-1 py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loadingAction === 'settle' ? 'Executing Settlement...' : 'Execute Interbank Settlement'}</span>
              </button>
            )}

            {payment.status === 'SETTLED' && (
              <button
                onClick={handleReconcile}
                disabled={loadingAction === 'reconcile'}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#0070e0] hover:bg-[#005cb8] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loadingAction === 'reconcile' ? 'Reconciling...' : 'Confirm Bilateral Reconciliation'}</span>
              </button>
            )}

            {payment.status === 'RECONCILED' && (
              <div className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transfer fully settled and reconciled across both financial institutions.</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Hyperledger Fabric Ledger Certificate */}
        <div className="py-4 space-y-2">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#0070e0]" />
            <span>Hyperledger Fabric Consortium Certificate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-700">
            <div>
              <span className="text-slate-400">Ledger Status: </span>
              <span className={payment.ledgerCommitted ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                {payment.ledgerCommitted ? 'COMMITTED TO WORLD STATE' : 'PENDING'}
              </span>
            </div>
            {payment.fabricBlockHash && (
              <div className="truncate">
                <span className="text-slate-400">Block Hash: </span>
                <span className="text-slate-900 font-semibold">{payment.fabricBlockHash}</span>
              </div>
            )}
            {payment.fabricTxId && (
              <div className="truncate">
                <span className="text-slate-400">Fabric Tx ID: </span>
                <span className="text-slate-700">{payment.fabricTxId}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Consortium Channel: </span>
              <span className="text-slate-700">transnational-channel (Org1MSP, Org2MSP, Org3MSP)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
