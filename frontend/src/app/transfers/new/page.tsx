'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '@/lib/api';

const INSTITUTIONS = [
  { code: 'GSB_US', name: 'Global Settlement Bank', country: 'US', currency: 'USD', rail: 'Fedwire' },
  { code: 'EUROT_DE', name: 'EuroTransact AG', country: 'DE', currency: 'EUR', rail: 'Target2' },
  { code: 'PACIFIC_SG', name: 'Pacific Rim Financial', country: 'SG', currency: 'SGD', rail: 'MEPS+' },
];

const FIXTURES = [
  {
    key: 'LEGIT_CLEAN',
    title: 'Low-Risk Interbank Settlement',
    badge: 'Approved',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Clean bilateral correspondent wire profile with balanced PCA latent features. Expected fraud score < 0.05% (Approved).',
  },
  {
    key: 'SUSPICIOUS_VELOCITY',
    title: 'Elevated Velocity / Borderline Anomaly',
    badge: 'Manual Review',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Unusual PCA skew in sensitive latency components (V4, V11, V12). Expected fraud score ~ 35-55% (Flagged for Review).',
  },
  {
    key: 'HIGH_RISK_FRAUD',
    title: 'High-Risk Known Fraud Signature',
    badge: 'Rejection Hold',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
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

  // Approximate FX estimate
  const exchangeRate = currency === 'USD' && targetCurrency === 'EUR' ? 0.92 : currency === 'EUR' && targetCurrency === 'USD' ? 1.08 : currency === 'USD' && targetCurrency === 'SGD' ? 1.35 : 1.0;
  const estimatedTargetAmount = (amount * exchangeRate).toFixed(2);
  const estimatedFeeUSD = 18.50;
  const estimatedSpreadBps = 12;
  const estimatedMinutes = 45;

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
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Initiate Institutional Wire Transfer
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-agent pipeline: LightGBM fraud evaluation, compliance screening, Google OR-Tools routing, and Fabric consensus.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Institutions & Parties */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0070e0]" />
              <span>1. Originating & Beneficiary Institutions</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Bilateral Clearing Rails</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Origin Bank Card */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Originating Bank (Sender)
              </label>
              <select
                value={senderBank}
                onChange={(e) => handleSenderChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium shadow-2xs"
              >
                {INSTITUTIONS.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.code} — {inst.name} ({inst.country} • {inst.rail})
                  </option>
                ))}
              </select>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Originator Legal Entity
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Destination Bank Card */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Beneficiary Bank (Receiver)
              </label>
              <select
                value={receiverBank}
                onChange={(e) => handleReceiverChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium shadow-2xs"
              >
                {INSTITUTIONS.filter((inst) => inst.code !== senderBank).map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.code} — {inst.name} ({inst.country} • {inst.rail})
                  </option>
                ))}
              </select>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Beneficiary Legal Entity
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Transfer Amount & Currency */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#0070e0]" />
              <span>2. Transfer Amount & Settlement Currency</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Spot FX Conversion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Principal Transfer Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'S$'}
                </span>
                <input
                  type="number"
                  min="100"
                  max="1000000"
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-base font-bold rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#0070e0] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Estimated Target Settlement ({targetCurrency})
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 flex items-center justify-between">
                <span>
                  {targetCurrency} {Number(estimatedTargetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  Rate: 1 {currency} = {exchangeRate} {targetCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Route Estimate & Cost Assumptions (Screen 3 Requirement) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#0070e0]" />
              <span>3. Route Estimate & Settlement Assumptions</span>
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              OR-Tools MIP Solver Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Base Fee</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">${estimatedFeeUSD.toFixed(2)} USD</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Correspondent Hop Cost</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FX Spread Margin</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">{estimatedSpreadBps} bps</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Optimized Liquidity Spread</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Settlement Window</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">{estimatedMinutes} Minutes</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">RTGS Finality Window</span>
            </div>
          </div>
        </div>

        {/* Step 4: AI Fraud & Compliance Screening (Synthetic Benchmark) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. AI Fraud Model & Compliance Screening</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Model: bolewara/credit-card-fraud-detector
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-[#0070e0] mr-1">Benchmark Vector Notice:</span>
            The pre-trained LightGBM classifier requires 29 specific PCA latent features (<code className="bg-white px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">V1..V28, Amount</code>). Ordinary wire parameters (BIC, country) are not mapped to PCA components. Choose a synthetic benchmark vector below to demonstrate model inference:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {FIXTURES.map((fixture) => {
              const isSelected = benchmarkKey === fixture.key;
              return (
                <div
                  key={fixture.key}
                  onClick={() => setBenchmarkKey(fixture.key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/60 border-[#0070e0] shadow-xs ring-1 ring-[#0070e0]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{fixture.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fixture.badgeColor}`}>
                        {fixture.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {fixture.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">{isSelected ? '✓ Selected' : 'Click to test'}</span>
                    <span className="font-mono text-slate-400">{fixture.key}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Action Pill Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-full text-sm font-semibold bg-[#0070e0] hover:bg-[#005cb8] text-white shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Initiating Pipeline...' : 'Confirm & Initiate Transfer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
