'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  DollarSign,
  ShieldCheck,
  Network,
  Cpu,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

const INSTITUTIONS = [
  { code: 'GSB_US', name: 'Global Settlement Bank', country: 'US', currency: 'USD' },
  { code: 'EUROT_DE', name: 'EuroTransact AG', country: 'DE', currency: 'EUR' },
  { code: 'PACIFIC_SG', name: 'Pacific Rim Financial', country: 'SG', currency: 'SGD' },
];

const FIXTURES = [
  {
    key: 'LEGIT_CLEAN',
    title: 'Low-Risk Interbank Settlement',
    badge: 'Standard Traffic',
    color: 'emerald',
    description: 'Clean bilateral correspondent wire profile with balanced PCA latent features. Expected fraud score < 0.05% (Approved).',
  },
  {
    key: 'SUSPICIOUS_VELOCITY',
    title: 'Elevated Velocity / Borderline Anomaly',
    badge: 'Manual Review Trigger',
    color: 'amber',
    description: 'Unusual PCA skew in sensitive latency components (V4, V11, V12). Expected fraud score ~ 35-55% (Flagged for Review).',
  },
  {
    key: 'HIGH_RISK_FRAUD',
    title: 'High-Risk Known Fraud Signature',
    badge: 'Rejection Trigger',
    color: 'rose',
    description: 'Extreme negative PCA values in primary discriminators (V10, V12, V14, V17). Expected fraud score > 90% (Held / Blocked).',
  },
];

export default function NewTransferPage() {
  const router = useRouter();

  const [senderBank, setSenderBank] = useState('GSB_US');
  const [senderName, setSenderName] = useState('Apex Global Logistics LLC');
  const [receiverBank, setReceiverBank] = useState('EUROT_DE');
  const [receiverName, setReceiverName] = useState('Bavaria Tech GmbH');
  const [amount, setAmount] = useState<number>(50000);
  const [currency, setCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [benchmarkKey, setBenchmarkKey] = useState('LEGIT_CLEAN');
  const [routingPriority, setRoutingPriority] = useState('BALANCED');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update currencies automatically when bank changes
  const handleSenderChange = (code: string) => {
    setSenderBank(code);
    const bank = INSTITUTIONS.find((b) => b.code === code);
    if (bank) setCurrency(bank.currency);
    if (code === receiverBank) {
      const alt = INSTITUTIONS.find((b) => b.code !== code);
      if (alt) {
        setReceiverBank(alt.code);
        setTargetCurrency(alt.currency);
      }
    }
  };

  const handleReceiverChange = (code: string) => {
    setReceiverBank(code);
    const bank = INSTITUTIONS.find((b) => b.code === code);
    if (bank) setTargetCurrency(bank.currency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senderBank === receiverBank) {
      setErrorMsg('Sender institution and beneficiary institution must be different.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const created = await api.createPayment({
        senderName,
        senderBank,
        receiverName,
        receiverBank,
        amount: Number(amount),
        currency,
        targetCurrency,
        benchmarkFixtureKey: benchmarkKey,
        routingPriority,
      });

      router.push(`/?paymentId=${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Initiate Institutional Cross-Border Transfer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage 1-3 Orchestration: Triggers LightGBM fraud evaluation, compliance screening, OR-Tools routing, and Hyperledger Fabric state creation.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Institutions & Corridor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-400" />
            <span>1. Financial Institutions & Parties</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Bank */}
            <div className="space-y-2 p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <label className="text-xs font-medium text-slate-300 block">
                Originating Institution (Bank A)
              </label>
              <select
                value={senderBank}
                onChange={(e) => handleSenderChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                {INSTITUTIONS.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.code} - {inst.name} ({inst.country} / {inst.currency})
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Originator Entity Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Destination Bank */}
            <div className="space-y-2 p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <label className="text-xs font-medium text-slate-300 block">
                Beneficiary Institution (Bank B / C)
              </label>
              <select
                value={receiverBank}
                onChange={(e) => handleReceiverChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                {INSTITUTIONS.filter((inst) => inst.code !== senderBank).map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.code} - {inst.name} ({inst.country} / {inst.currency})
                  </option>
                ))}
              </select>

              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Beneficiary Entity Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Amounts & FX */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>2. Transfer Amount & Currencies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Transfer Amount ({currency})
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Source Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target Currency
              </label>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Synthetic Benchmark Vector Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>3. AI Fraud Model Benchmark Vector</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              29 PCA Features (V1..V28, Amount)
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select a synthetic test profile to demonstrate model scoring without entering raw card PCA coordinates:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FIXTURES.map((fix) => {
              const isSelected = benchmarkKey === fix.key;
              return (
                <div
                  key={fix.key}
                  onClick={() => setBenchmarkKey(fix.key)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fix.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${
                        fix.color === 'emerald'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : fix.color === 'amber'
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {fix.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {fix.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Routing Strategy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" />
            <span>4. Google OR-Tools Routing Objective</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
            {['BALANCED', 'LOW_COST', 'FASTEST'].map((priority) => (
              <div
                key={priority}
                onClick={() => setRoutingPriority(priority)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  routingPriority === priority
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 font-semibold'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {priority}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-brand-600/30 font-mono"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Executing Pipeline...' : 'Initiate Transfer & Run Pre-Screen'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
