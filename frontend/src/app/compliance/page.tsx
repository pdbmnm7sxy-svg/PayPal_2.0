'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Zap,
  Search,
} from 'lucide-react';

export default function ComplianceEditorialPage() {
  const [testAmount, setTestAmount] = useState<number>(50000);
  const [selectedFixture, setSelectedFixture] = useState<string>('LEGIT_CLEAN');
  const [senderName, setSenderName] = useState<string>('Standard Commercial Corp');
  const [senderCountry, setSenderCountry] = useState<string>('US');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const [fraudRes, compRes] = await Promise.all([
        fetch('http://localhost:8000/api/fraud/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            benchmark_fixture_key: selectedFixture,
            transfer_amount: testAmount,
          }),
        }).then((r) => r.json()),
        fetch('http://localhost:8000/api/compliance/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_name: senderName,
            sender_institution: 'GSB_US',
            sender_country: senderCountry,
            receiver_name: 'Bavaria Industrie AG',
            receiver_institution: 'EUROT_DE',
            receiver_country: 'DE',
            amount: testAmount,
            currency: 'USD',
          }),
        }).then((r) => r.json()),
      ]);

      setResult({ fraud: fraudRes, compliance: compRes });
    } catch (e: any) {
      alert(`Error calling AI service: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Masthead */}
      <div className="border-b-2 border-white/20 pb-5 pt-2">
        <div className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
          INVESTIGATIVE INTELLIGENCE DOSSIER // ML FRAUD &amp; OFAC WATCHLISTS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mt-1 font-editorial uppercase">
          AI Risk &amp; Compliance Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Rigorous technical disclosure, Hugging Face model provenance, and automated AML screening rules.
        </p>
      </div>

      {/* Asymmetric 2-Column Broadsheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Model Provenance Dossier (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold">
              01 // MODEL PROVENANCE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              bolewara/credit-card-fraud
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-space-850 border border-white/[0.06] space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400">Model Pipeline: </span>
              <span className="text-white font-bold">LightGBM (Scikit-learn compatible)</span>
            </div>
            <div>
              <span className="text-slate-400">Pinned Revision: </span>
              <span className="text-violet-300">20b4630d5b3bfbe1f46a91af620fa389f23a07a8</span>
            </div>
            <div>
              <span className="text-slate-400">Artifact File: </span>
              <span className="text-white">fraud_model.joblib (259 KB)</span>
            </div>
            <div>
              <span className="text-slate-400">Feature Schema: </span>
              <span className="text-white font-bold">29 features (V1..V28 and Amount)</span>
            </div>
            <div>
              <span className="text-slate-400">Training Benchmark: </span>
              <span className="text-white">ULB credit card dataset (284,807 tx)</span>
            </div>
            <div>
              <span className="text-slate-400">Reported AUC: </span>
              <span className="text-emerald-400 font-bold">0.947</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-space-850 border border-white/[0.04] text-xs text-slate-300 space-y-2 font-sans">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Info className="w-3.5 h-3.5" />
              <span>Mandatory Disclosure Notice:</span>
            </div>
            <p className="leading-relaxed">
              1. The 28 PCA features reflect statistical card transactions. In this cross-border interbank prototype, synthetic benchmark vectors are supplied to test model latency and scoring without spoofing fake features.
            </p>
            <p className="leading-relaxed">
              2. This model does NOT perform KYC, PEP, or AML watchlist screening. Sanctions and watchlist screening are handled by simulated deterministic compliance engines.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Bench (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              02 // INVESTIGATIVE BENCH
            </span>
            <span className="text-[10px] font-mono text-slate-400">LIVE FASTAPI</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                Synthetic Benchmark Fixture
              </label>
              <select
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value)}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              >
                <option value="LEGIT_CLEAN">LEGIT_CLEAN (Low Risk &lt; 0.05%)</option>
                <option value="SUSPICIOUS_VELOCITY">SUSPICIOUS_VELOCITY (Borderline ~40%)</option>
                <option value="HIGH_RISK_FRAUD">HIGH_RISK_FRAUD (Extreme Risk &gt; 90%)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                Originating Entity (AML Check)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Tip: Enter &ldquo;Vasily Malyshev&rdquo; to trigger the simulated OFAC sanctions block.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                Wire Amount (USD)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500 font-bold"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-glow-violet active:scale-98"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Evaluating Model...' : 'Execute Dual Screening'}</span>
            </button>
          </div>

          {result && (
            <div className="p-4 rounded-2xl bg-space-850 border border-white/[0.06] space-y-3 font-mono text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">LightGBM Probability:</span>
                <span
                  className={`font-bold text-sm ${
                    result.fraud.risk_level === 'HIGH'
                      ? 'text-rose-400'
                      : result.fraud.risk_level === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(result.fraud.fraud_probability * 100).toFixed(3)}% ({result.fraud.risk_level})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">OFAC Sanctions Status:</span>
                <span
                  className={`font-bold ${
                    result.compliance.compliance_status === 'REJECTED'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {result.compliance.compliance_status}
                </span>
              </div>

              {result.compliance.flags?.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                  {result.compliance.flags.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{f.rule_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
