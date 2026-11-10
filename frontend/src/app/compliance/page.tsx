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
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#0070e0]" />
          <span>AI Fraud Scoring & Compliance Screening Hub</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Technical transparency, Hugging Face model provenance, and demo-only KYC/AML rule verification.
        </p>
      </div>

      {/* Model Provenance & Disclosure Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Hugging Face Model Architecture & Attribution
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0070e0] border border-blue-200">
            LightGBM Classifier Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
            <div><span className="text-slate-400 font-medium">Repository: </span><a href="https://huggingface.co/bolewara/credit-card-fraud-detector" target="_blank" rel="noreferrer" className="text-[#0070e0] font-semibold underline">bolewara/credit-card-fraud-detector</a></div>
            <div><span className="text-slate-400 font-medium">Pinned Revision: </span><span className="text-slate-900 font-mono text-[11px]">20b4630d5b3bfbe1f46a91af620fa389f23a07a8</span></div>
            <div><span className="text-slate-400 font-medium">Artifact File: </span><span className="text-slate-900 font-semibold font-mono text-[11px]">fraud_model.joblib (259 KB)</span></div>
            <div><span className="text-slate-400 font-medium">Feature Schema: </span><span className="text-slate-900 font-semibold">29 features (V1..V28 and Amount)</span></div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
            <div><span className="text-slate-400 font-medium">Training Dataset: </span><span className="text-slate-900">ULB credit card benchmark (284,807 tx)</span></div>
            <div><span className="text-slate-400 font-medium">Imbalance Handling: </span><span className="text-slate-900">0.17% fraud rate (class weights)</span></div>
            <div><span className="text-slate-400 font-medium">Reported AUC: </span><span className="text-emerald-700 font-bold">0.947</span></div>
            <div><span className="text-slate-400 font-medium">Intended Use: </span><span className="text-slate-900">Proof-of-concept anomaly risk demonstration</span></div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-semibold">Domain Separation Guarantee: </strong>
            Because wholesale cross-border wire fields (SWIFT BIC, legal entity, recipient country) are completely distinct from retail credit card PCA dimensions, Transnational strictly maintains feature isolation. Synthetic benchmark vectors are supplied to test model classification without fabricating synthetic identity compromise.
          </div>
        </div>
      </div>

      {/* Interactive Compliance & Fraud Test Bench */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-[#0070e0]" />
            <span>Interactive Screening Testbench</span>
          </h3>
          <span className="text-xs text-slate-400">Live Fast-API Evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Benchmark Vector</label>
            <select
              value={selectedFixture}
              onChange={(e) => setSelectedFixture(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium"
            >
              <option value="LEGIT_CLEAN">LEGIT_CLEAN (Low Risk)</option>
              <option value="SUSPICIOUS_VELOCITY">SUSPICIOUS_VELOCITY (Review)</option>
              <option value="HIGH_RISK_FRAUD">HIGH_RISK_FRAUD (Block)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Transfer Amount (USD)</label>
            <input
              type="number"
              step="5000"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0070e0]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Originator Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Origin Jurisdiction</label>
            <select
              value={senderCountry}
              onChange={(e) => setSenderCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium"
            >
              <option value="US">United States (Clean)</option>
              <option value="DE">Germany (Clean)</option>
              <option value="SG">Singapore (Clean)</option>
              <option value="IR">Iran (FATF Blacklist Trigger)</option>
              <option value="KP">North Korea (OFAC Sanctions Trigger)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleTest}
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#0070e0] hover:bg-[#005cb8] text-white flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Evaluating Model...' : 'Run Dual Risk Screening'}</span>
          </button>
        </div>
      </div>

      {/* Results Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Screening Evaluation Output
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fraud Result */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">LightGBM Model Score</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  result.fraud?.decision === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {result.fraud?.decision}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {(Number(result.fraud?.fraud_probability || 0) * 100).toFixed(3)}%
              </div>
              <p className="text-xs text-slate-500">
                Risk Tier: <strong className="text-slate-800">{result.fraud?.risk_level}</strong> • Anomaly threshold: 30%
              </p>
            </div>

            {/* Compliance Result */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">Rules-Engine KYC/AML</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  result.compliance?.overall_status === 'CLEARED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {result.compliance?.overall_status}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {result.compliance?.blocked ? 'Sanctions / Jurisdiction Blocked' : 'Regulatory Screen Passed'}
              </div>
              <div className="text-xs text-slate-500">
                Flags Triggered: <strong className="text-slate-800">{result.compliance?.flags?.length || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
