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
  Send,
  Sparkles,
  Clock,
  Coins,
  AlertCircle,
  CreditCard,
  ChevronRight,
  ChevronLeft,
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
    title: 'Low-Risk Interbank Settlement',
    badge: 'Approved',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Clean bilateral correspondent wire profile with balanced PCA latent features. Expected fraud score < 0.05% (Approved).',
  },
  {
    key: 'SUSPICIOUS_VELOCITY',
    title: 'Elevated Velocity / Borderline Anomaly',
    badge: 'Manual Review',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description: 'Unusual PCA skew in sensitive latency components (V4, V11, V12). Expected fraud score ~ 35-55% (Flagged for Review).',
  },
  {
    key: 'HIGH_RISK_FRAUD',
    title: 'High-Risk Known Fraud Signature',
    badge: 'Rejection Hold',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Extreme negative PCA values in primary discriminators (V10, V12, V14, V17). Expected fraud score > 90% (Held / Blocked).',
  },
];

export default function NewTransferPage() {
  const router = useRouter();

  // Multi-step state: 1 = Corridor & Counterparties, 2 = Amount & Route, 3 = Risk & Funding Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
  const estimatedSpreadBps = 12;
  const estimatedMinutes = 45;

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Initiate Wholesale Cross-Border Transfer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional wire initiation with real-time OR-Tools route calculation, Hugging Face risk scoring, and PayPal Sandbox funding.
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="hidden sm:flex items-center gap-2">
          {[
            { step: 1, label: 'Corridor' },
            { step: 2, label: 'Amount & FX' },
            { step: 3, label: 'Risk & Confirm' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentStep === s.step
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : currentStep > s.step
                  ? 'bg-violet-950/40 text-violet-300 border border-violet-500/30'
                  : 'bg-[#10121d] text-slate-400 border border-white/[0.06]'
              }`}
            >
              <span>{s.step}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Corridor & Counterparty Details */}
        {currentStep === 1 && (
          <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-6 shadow-card-dark space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-violet-400" />
                Step 1: Financial Institutions &amp; Counterparties
              </span>
              <span className="text-xs text-slate-400 font-mono">Bilateral Clearing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Originating Bank */}
              <div className="space-y-3 p-4 rounded-xl bg-[#141726] border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block">
                  Originating Financial Institution
                </label>
                <div className="space-y-2">
                  {INSTITUTIONS.map((inst) => (
                    <div
                      key={inst.code}
                      onClick={() => handleSenderChange(inst.code)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        senderBank === inst.code
                          ? 'bg-[#1a1e35] border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                          : 'bg-[#10121e] border-white/[0.06] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">
                          {inst.code}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{inst.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-violet-300">
                        {inst.currency} ({inst.rail})
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Originating Entity Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="w-full bg-[#10121d] border border-white/[0.08] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              {/* Beneficiary Bank */}
              <div className="space-y-3 p-4 rounded-xl bg-[#141726] border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block">
                  Beneficiary Financial Institution
                </label>
                <div className="space-y-2">
                  {INSTITUTIONS.map((inst) => (
                    <div
                      key={inst.code}
                      onClick={() => handleReceiverChange(inst.code)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        receiverBank === inst.code
                          ? 'bg-[#1a1e35] border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                          : 'bg-[#10121e] border-white/[0.06] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-white block">
                          {inst.code}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{inst.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-violet-300">
                        {inst.currency} ({inst.rail})
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Beneficiary Entity Name
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="w-full bg-[#10121d] border border-white/[0.08] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.25)]"
              >
                <span>Continue to Amount &amp; FX</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Amount, Real-Time FX & Routing Constraints */}
        {currentStep === 2 && (
          <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-6 shadow-card-dark space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-400" />
                Step 2: Transfer Amount, FX Rate &amp; OR-Tools Strategy
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currency} → {targetCurrency}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Principal Transfer Amount ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      required
                      className="w-full bg-[#141726] border border-white/[0.08] text-base font-bold text-white font-mono rounded-xl pl-16 pr-4 py-2.5 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    OR-Tools Optimization Objective
                  </label>
                  <select
                    value={routingPriority}
                    onChange={(e) => setRoutingPriority(e.target.value)}
                    className="w-full bg-[#141726] border border-white/[0.08] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="BALANCED">Balanced (Cost + Time Optimization)</option>
                    <option value="SPEED">Speed First (Direct RTGS Minimum Window)</option>
                    <option value="COST">Cost First (Minimum Interbank Hop Fees)</option>
                  </select>
                </div>
              </div>

              {/* Live FX & Corridor Cost Preview */}
              <div className="p-4 rounded-xl bg-[#141726] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Exchange Rate:</span>
                  <span className="font-mono text-white font-semibold">
                    1 {currency} = {exchangeRate} {targetCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Beneficiary Receipt:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {targetCurrency} {Number(estimatedTargetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Corridor Fee:</span>
                  <span className="font-mono text-slate-200">${estimatedFeeUSD} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Settlement Window:</span>
                  <span className="font-mono text-violet-300">~{estimatedMinutes} minutes</span>
                </div>
                <div className="pt-2 border-t border-white/[0.04] text-[11px] text-slate-400 italic">
                  Note: Interbank FX rates and corridor fees are simulated for this hackathon prototype.
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl bg-[#141726] hover:bg-[#1a1e32] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.25)]"
              >
                <span>Continue to Risk &amp; Confirmation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Risk Vector, Funding Mode & Confirmation */}
        {currentStep === 3 && (
          <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-6 shadow-card-dark space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                Step 3: AI Fraud Model Benchmark &amp; Funding Authorization
              </span>
              <span className="text-xs text-emerald-400 font-mono">Pre-Flight Review</span>
            </div>

            {/* Synthetic Vector Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Select Synthetic Benchmark Feature Vector (Hugging Face Model):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FIXTURES.map((fix) => (
                  <div
                    key={fix.key}
                    onClick={() => setBenchmarkKey(fix.key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      benchmarkKey === fix.key
                        ? 'bg-[#181c30] border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                        : 'bg-[#141726] border-white/[0.06] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{fix.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mb-2 ${fix.badgeColor}`}
                    >
                      {fix.badge}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {fix.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-Flight Summary Review Card */}
            <div className="p-4 rounded-xl bg-[#141726] border border-white/[0.06] space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Transfer Pre-Flight Specification
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Corridor</span>
                  <span className="font-mono text-white font-semibold">
                    {senderBank} → {receiverBank}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Amount</span>
                  <span className="font-mono text-white font-semibold">
                    {currency} {Number(amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Target Settlement</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {targetCurrency} {Number(estimatedTargetAmount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Funding Rails</span>
                  <span className="font-mono text-sky-400 font-semibold">
                    PayPal Sandbox
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl bg-[#141726] hover:bg-[#1a1e32] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Submitting & Evaluating Model...'
                    : 'Initiate Transfer & Launch Workflow'}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
