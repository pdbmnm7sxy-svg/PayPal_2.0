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
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          <span>AI Fraud Scoring & Compliance Screening Hub</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical transparency, Hugging Face model provenance, and demo-only KYC/AML rule verification.
        </p>
      </div>

      {/* Model Provenance & Disclosure Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Hugging Face Model Architecture & Attribution
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
            LightGBM Classifier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 space-y-1.5 text-slate-300">
            <div><span className="text-slate-400">Repository: </span><a href="https://huggingface.co/bolewara/credit-card-fraud-detector" target="_blank" rel="noreferrer" className="text-brand-400 underline">bolewara/credit-card-fraud-detector</a></div>
            <div><span className="text-slate-400">Pinned Revision: </span><span className="text-white">20b4630d5b3bfbe1f46a91af620fa389f23a07a8</span></div>
            <div><span className="text-slate-400">Artifact File: </span><span className="text-white">fraud_model.joblib (259 KB)</span></div>
            <div><span className="text-slate-400">Feature Schema: </span><span className="text-white">29 features (V1..V28 and Amount)</span></div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 space-y-1.5 text-slate-300">
            <div><span className="text-slate-400">Training Dataset: </span><span className="text-white">ULB credit card fraud benchmark (284,807 transactions)</span></div>
            <div><span className="text-slate-400">Class Imbalance: </span><span className="text-white">0.17% fraud rate (balanced via class weights)</span></div>
            <div><span className="text-slate-400">Test AUC: </span><span className="text-emerald-400 font-semibold">0.947</span></div>
            <div><span className="text-slate-400">Average Precision: </span><span className="text-emerald-400 font-semibold">0.791</span></div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Operational Boundary Notice: </span>
            The model consumes anonymized PCA-transformed features (V1–V28) and Amount. It is integrated here to demonstrate binary machine learning inference over transactional latent spaces. It does not calibrate production interbank wire fraud or real-world money laundering, nor does it perform regulatory KYC checks.
          </div>
        </div>
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-brand-400" />
          <span>Interactive Benchmark Inference Tester</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Select Benchmark Profile</label>
            <select
              value={selectedFixture}
              onChange={(e) => setSelectedFixture(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="LEGIT_CLEAN">Clean Interbank (Low Risk)</option>
              <option value="SUSPICIOUS_VELOCITY">Velocity Spike (Medium Risk)</option>
              <option value="HIGH_RISK_FRAUD">Stolen Card Signature (High Risk)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Transfer Amount (USD)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Originator Entity (Try "Vasily Malyshev" for block)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 font-mono"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading ? 'Evaluating Model...' : 'Run Dual Scoring Test'}</span>
          </button>
        </div>

        {/* Live Evaluation Output */}
        {result && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fraud Result */}
            <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">LightGBM Model Score</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-brand-300">
                  {result.fraud.risk_level}
                </span>
              </div>
              <div>Fraud Probability: <span className="text-white font-bold">{(result.fraud.fraud_probability * 100).toFixed(4)}%</span></div>
              <div>Decision: <span className="text-brand-300">{result.fraud.decision}</span></div>
            </div>

            {/* Compliance Result */}
            <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">Compliance Engine</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${result.compliance.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                  {result.compliance.status}
                </span>
              </div>
              <div>Passed: <span className="text-white">{String(result.compliance.passed)}</span></div>
              <div>Risk Score: <span className="text-white">{result.compliance.risk_score}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
