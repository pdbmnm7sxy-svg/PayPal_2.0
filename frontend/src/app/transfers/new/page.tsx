'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  DollarSign,
  ShieldCheck,
  Send,
  ArrowRight,
  Sparkles,
  Clock,
  Coins,
  AlertCircle,
  CreditCard,
  Zap,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { api } from '@/lib/api';

const INSTITUTIONS = [
  { code: 'GSB_US', name: 'Global Settlement Bank', city: 'New York', country: 'US', currency: 'USD', rail: 'Fedwire' },
  { code: 'EUROT_DE', name: 'EuroTransact AG', city: 'Frankfurt', country: 'DE', currency: 'EUR', rail: 'Target2' },
  { code: 'PACIFIC_SG', name: 'Pacific Rim Financial', city: 'Singapore', country: 'SG', currency: 'SGD', rail: 'MEPS+' },
];

const FIXTURES = [
  {
    key: 'LEGIT_CLEAN',
    title: 'Low-Risk Interbank Wire',
    badge: 'Approved',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Clean bilateral wire profile with balanced PCA latent features. Expected LightGBM score < 0.05% (Approved).',
  },
  {
    key: 'SUSPICIOUS_VELOCITY',
    title: 'Elevated Velocity Anomaly',
    badge: 'Manual Review',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Unusual latency component variance (V4, V11, V12). Expected LightGBM score ~ 35-55% (Flagged for Review).',
  },
  {
    key: 'HIGH_RISK_FRAUD',
    title: 'High-Risk Fraud Vector',
    badge: 'Rejection Hold',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Extreme negative PCA values in primary discriminators (V10, V12, V14, V17). Expected LightGBM score > 90% (Held).',
  },
];

export default function SpatialWireStudioPage() {
  const router = useRouter();

  // Spatial Studio State
  const [senderBank, setSenderBank] = useState('GSB_US');
  const [senderName, setSenderName] = useState('Apex Global Logistics LLC');
  const [receiverBank, setReceiverBank] = useState('EUROT_DE');
  const [receiverName, setReceiverName] = useState('Bavaria Tech GmbH');
  const [amount, setAmount] = useState<number>(75000);
  const [currency, setCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [benchmarkKey, setBenchmarkKey] = useState('LEGIT_CLEAN');
  const [routingPriority, setRoutingPriority] = useState('BALANCED');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // FX calculations
  const exchangeRate =
    currency === 'USD' && targetCurrency === 'EUR'
      ? 0.92
      : currency === 'EUR' && targetCurrency === 'USD'
      ? 1.08
      : currency === 'USD' && targetCurrency === 'SGD'
      ? 1.35
      : 1.0;
  const estimatedTargetAmount = (amount * exchangeRate).toFixed(2);
  const estimatedFeeUSD = 18.5;
  const estimatedMinutes = routingPriority === 'SPEED' ? 25 : routingPriority === 'COST' ? 55 : 40;

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
      setErrorMsg('Originating institution and beneficiary institution cannot be the same.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const senderBankObj = INSTITUTIONS.find((b) => b.code === senderBank)!;
      const receiverBankObj = INSTITUTIONS.find((b) => b.code === receiverBank)!;

      const created = await api.createPayment({
        senderName,
        senderBank,
        senderCountry: senderBankObj.country,
        receiverName,
        receiverBank,
        receiverCountry: receiverBankObj.country,
        amount: Number(amount),
        currency,
        targetCurrency,
        benchmarkFixtureKey: benchmarkKey,
        routingPriority,
      });

      router.push(`/?highlight=${created.id}`);
    } catch (err: any) {
      console.error('Transfer submission error:', err);
      setErrorMsg(err.message || 'Failed to initiate transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
              Spatial Studio
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Interactive Wire Composer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Wholesale Wire Creation Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Simultaneous corridor routing, real-time FX spread calculation, and Hugging Face LightGBM pre-screening.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-space-900 px-3 py-1.5 rounded-xl border border-white/[0.08]">
            Orchestrator: NestJS + FastAPI
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Multi-Pane Spatial Form Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pane 1: Corridor & Counterparties (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Building className="w-4 h-4 text-violet-400" />
                01 // Counterparties
              </span>
              <span className="text-[10px] text-slate-400 font-mono">CORRIDOR</span>
            </div>

            {/* Sender Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Originating Institution
              </label>
              <div className="space-y-1.5">
                {INSTITUTIONS.map((inst) => (
                  <div
                    key={inst.code}
                    onClick={() => handleSenderChange(inst.code)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      senderBank === inst.code
                        ? 'bg-space-800 border-violet-500 text-white shadow-glow-violet'
                        : 'bg-space-850 border-white/[0.06] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-white block">
                        {inst.code}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{inst.city}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-violet-300">
                      {inst.currency}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">Entity Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  className="w-full bg-space-850 border border-white/[0.08] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-sans"
                />
              </div>
            </div>

            {/* Receiver Selection */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Beneficiary Institution
              </label>
              <div className="space-y-1.5">
                {INSTITUTIONS.map((inst) => (
                  <div
                    key={inst.code}
                    onClick={() => handleReceiverChange(inst.code)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      receiverBank === inst.code
                        ? 'bg-space-800 border-cyan-500 text-white shadow-glow-cyan'
                        : 'bg-space-850 border-white/[0.06] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-white block">
                        {inst.code}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{inst.city}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-cyan-300">
                      {inst.currency}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  required
                  className="w-full bg-space-850 border border-white/[0.08] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Pane 2: Amount, Live FX & OR-Tools Matrix (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                02 // Amount &amp; OR-Tools
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">MILP SOLVER</span>
            </div>

            {/* Principal Amount Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Transfer Principal ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full bg-space-850 border border-white/[0.08] text-lg font-bold text-white font-mono rounded-2xl pl-16 pr-4 py-3 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-2">
              {[25000, 50000, 100000, 250000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 border border-white/[0.06] text-[11px] font-mono text-slate-300"
                >
                  ${val / 1000}k
                </button>
              ))}
            </div>

            {/* OR-Tools Optimization Goal */}
            <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Corridor Optimization Objective
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'BALANCED', label: 'Balanced' },
                  { id: 'SPEED', label: 'Speed' },
                  { id: 'COST', label: 'Low Fee' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRoutingPriority(p.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold font-mono border transition-all ${
                      routingPriority === p.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-cyan'
                        : 'bg-space-850 border-white/[0.06] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live FX Calculation Card */}
            <div className="p-4 rounded-2xl bg-space-850 border border-white/[0.06] space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FX Settlement Rate:</span>
                <span className="font-bold text-white">
                  1 {currency} = {exchangeRate} {targetCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settled Sum:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {targetCurrency} {Number(estimatedTargetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Corridor Fees:</span>
                <span className="text-slate-200">${estimatedFeeUSD} USD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Transit:</span>
                <span className="text-violet-300 font-bold">~{estimatedMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Pane 3: Synthetic PCA Vector & Pre-Flight Review (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  03 // Risk Pre-Flight
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LIGHTGBM</span>
              </div>

              {/* Synthetic Fixtures */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Synthetic PCA Anonymized Vector:
                </label>
                <div className="space-y-2">
                  {FIXTURES.map((fix) => (
                    <div
                      key={fix.key}
                      onClick={() => setBenchmarkKey(fix.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        benchmarkKey === fix.key
                          ? 'bg-space-800 border-emerald-500 text-white shadow-glow-emerald'
                          : 'bg-space-850 border-white/[0.06] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{fix.title}</span>
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${fix.badgeColor}`}
                        >
                          {fix.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        {fix.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PayPal Sandbox Funding Notice */}
              <div className="p-3.5 rounded-xl bg-space-850 border border-white/[0.06] text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold font-mono text-[11px]">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Digital Funding via PayPal Sandbox</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Once launched, authorized sandbox checkout captures the order server-side before correspondent ledger settlement.
                </p>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-glow-violet active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Submitting & Evaluating ML Model...'
                    : 'Launch Transfer Vector & Open Triage'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
