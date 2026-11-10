'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Info,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../../lib/api';

export default function CompliancePage() {
  const [testAmount, setTestAmount] = useState<number>(25000);
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-white/[0.08]">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          <span>AI Fraud Scoring &amp; Compliance Screening Hub</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical transparency, Hugging Face model provenance, and demo-only KYC/AML rule verification.
        </p>
      </div>

      {/* Model Provenance & Disclosure Card */}
      <div className="p-6 rounded-2xl bg-[#10121d] border border-white/[0.08] shadow-card-dark space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Hugging Face Model Architecture &amp; Attribution
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
            LightGBM Classifier Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#141726] border border-white/[0.06] space-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-400 font-medium">Repository: </span>
              <a
                href="https://huggingface.co/bolewara/credit-card-fraud-detector"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 font-semibold underline hover:text-violet-300"
              >
                bolewara/credit-card-fraud-detector
              </a>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Pinned Revision: </span>
              <span className="text-slate-200 font-mono text-[11px]">20b4630d5b3bfbe1f46a91af620fa389f23a07a8</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Artifact File: </span>
              <span className="text-slate-200 font-semibold font-mono text-[11px]">fraud_model.joblib (259 KB)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Feature Schema: </span>
              <span className="text-slate-200 font-semibold">29 features (V1..V28 and Amount)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141726] border border-white/[0.06] space-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-400 font-medium">Training Dataset: </span>
              <span className="text-slate-200">ULB credit card benchmark (284,807 tx)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Imbalance Handling: </span>
              <span className="text-slate-200">0.17% fraud rate (class weights)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Reported AUC: </span>
              <span className="text-emerald-400 font-bold">0.947</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Intended Use: </span>
              <span className="text-slate-200">Proof-of-concept anomaly risk demonstration</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e101a] border border-white/[0.04] text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Production Disclaimers &amp; Ethical AI Limitations:</span>
          </div>
          <p>
            1. The 28 PCA features (V1..V28) reflect anonymized payment card behavior. They are evaluated using synthetic benchmark vectors to test model latency and classification behavior without spoofing fake features.
          </p>
          <p>
            2. This model does NOT perform Know-Your-Customer (KYC), Politically Exposed Persons (PEP), or Anti-Money-Laundering (AML) sanctions screening. Those checks are handled separately by simulated deterministic compliance rule-sets.
          </p>
        </div>
      </div>

      {/* Interactive Risk & AML Testing Bench */}
      <div className="p-6 rounded-2xl bg-[#10121d] border border-white/[0.08] shadow-card-dark space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-violet-400" />
            <span>Interactive Screening Workbench</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live FastAPI Inference</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Synthetic Vector Fixture
            </label>
            <select
              value={selectedFixture}
              onChange={(e) => setSelectedFixture(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="LEGIT_CLEAN">LEGIT_CLEAN (Low risk &lt; 0.05%)</option>
              <option value="SUSPICIOUS_VELOCITY">SUSPICIOUS_VELOCITY (Borderline ~40%)</option>
              <option value="HIGH_RISK_FRAUD">HIGH_RISK_FRAUD (Extreme &gt; 90%)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Sender Entity Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Tip: Test &ldquo;Vasily Malyshev&rdquo; or &ldquo;Kim Jong&rdquo; to trigger sanctions watchlists.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Test Amount (USD)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Evaluating Model & Screening...' : 'Execute Evaluation Bench'}</span>
          </button>
        </div>

        {/* Results view */}
        {result && (
          <div className="mt-5 p-4 rounded-xl bg-[#141726] border border-white/[0.06] space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Fraud Model Output */}
              <div className="p-3.5 rounded-xl bg-[#10121d] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">LightGBM Model Score</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      result.fraud.risk_level === 'HIGH'
                        ? 'text-rose-400'
                        : result.fraud.risk_level === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {(result.fraud.fraud_probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="text-slate-400">
                  Decision: <strong className="text-white">{result.fraud.decision}</strong> | Level:{' '}
                  <strong className="text-white">{result.fraud.risk_level}</strong>
                </div>
                {result.fraud.top_features && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block mb-1">Feature Drivers:</span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {result.fraud.top_features.map((tf: any, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-violet-300">
                          {tf.feature}: {tf.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance Output */}
              <div className="p-3.5 rounded-xl bg-[#10121d] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Simulated AML / Sanctions</span>
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
                <div className="text-slate-400">
                  Action: <strong className="text-white">{result.compliance.recommended_action}</strong>
                </div>
                {result.compliance.flags?.length > 0 ? (
                  <div className="pt-2 border-t border-white/[0.04] space-y-1">
                    {result.compliance.flags.map((f: any, i: number) => (
                      <div key={i} className="text-rose-300 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{f.rule_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-emerald-400 text-[11px] flex items-center gap-1 pt-2 border-t border-white/[0.04]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>No watchlist matches or jurisdiction restrictions detected.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
