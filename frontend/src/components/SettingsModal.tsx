'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  CreditCard,
  Cpu,
  Database,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [paypalCfg, setPaypalCfg] = useState<{ configured: boolean; clientId?: string } | null>(null);
  const [fabricStats, setFabricStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.getPayPalClientId().then((res) => setPaypalCfg({ configured: res.configured, clientId: res.clientId || undefined })).catch(() => setPaypalCfg({ configured: false }));
      api.getLedgerBlocks(20).then((res) => setFabricStats(res)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0f111d] border border-white/10 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System & Simulation Settings</h2>
              <p className="text-xs text-slate-400">Transnational Orchestration Runtime & Node Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Environment details */}
          <div className="p-3.5 rounded-xl bg-[#141726] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-violet-400" />
                Database Engine
              </span>
              <span className="font-mono text-slate-200">PostgreSQL (TypeORM)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                Fraud Classifier
              </span>
              <span className="font-mono text-slate-200">bolewara/credit-card-fraud-detector (LightGBM)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-violet-400" />
                Interbank Routing
              </span>
              <span className="font-mono text-slate-200">Google OR-Tools MILP Solver</span>
            </div>
          </div>

          {/* PayPal Sandbox Status */}
          <div className="p-3.5 rounded-xl bg-[#141726] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                PayPal Developer Sandbox
              </span>
              {paypalCfg?.configured ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Credentials Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Demo Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When real Sandbox credentials are provided in `.env`, checkout calls the live PayPal Orders v2 API. Otherwise, payments are processed with explicit demo simulation labels.
            </p>
          </div>

          {/* Consortium Ledger */}
          <div className="p-3.5 rounded-xl bg-[#141726] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-violet-400" />
                Hyperledger Fabric Ledger
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                {fabricStats?.length || 1} Blocks Committed
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains cryptographic SHA-256 audit records across the 3 consortium member banks (`GSB_US`, `EUROT_DE`, `PACIFIC_SG`).
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
