'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  DollarSign,
  Send,
  Network,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BankNode } from '../../types';
import { api } from '../../lib/api';

export default function InstitutionsPage() {
  const [banks, setBanks] = useState<BankNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBanks().then((res) => {
      setBanks(res);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load banks:', err);
      setLoading(false);
    });
  }, []);

  const getRailInfo = (code: string) => {
    switch (code) {
      case 'GSB_US':
        return { rail: 'Fedwire / CHIPS (US RTGS)', cutOff: '17:00 EST', status: 'Optimal' };
      case 'EUROT_DE':
        return { rail: 'Target2 / EURO1 (ECB RTGS)', cutOff: '18:00 CET', status: 'Optimal' };
      case 'PACIFIC_SG':
        return { rail: 'MEPS+ (MAS RTGS)', cutOff: '19:00 SGT', status: 'Optimal' };
      default:
        return { rail: 'Correspondent Commercial Clearing', cutOff: '24/7 Continuous', status: 'Active' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#0070e0]" />
            <span>Consortium Member Institutions & Clearing Nodes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Permissioned financial participants, Nostro/Vostro liquidity balances, and central bank RTGS settlement rails
          </p>
        </div>

        <Link
          href="/transfers/new"
          className="px-5 py-2.5 rounded-full bg-[#0070e0] hover:bg-[#005cb8] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Initiate Wire</span>
        </Link>
      </div>

      {/* Grid of Banks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {banks.map((bank) => {
          const rail = getRailInfo(bank.code);
          return (
            <div
              key={bank.code}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#0070e0] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {bank.code}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {rail.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">
                  {bank.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jurisdiction: {bank.country} • Currency: {bank.currency}
                </p>

                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Reserves:</span>
                    <span className="font-bold text-slate-900 font-sans">
                      {bank.currency} {(Number(bank.liquidityBalance) / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clearing Rail:</span>
                    <span className="font-semibold text-slate-800">{rail.rail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Cutoff:</span>
                    <span className="font-medium text-slate-600">{rail.cutOff}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Org MSP: {bank.code}MSP</span>
                <Link
                  href={`/transfers/new?source=${bank.code}`}
                  className="text-[#0070e0] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Send From Here</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corridor Routing Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-[#0070e0]" />
            <span>Multi-Hop Corridor Optimization (Google OR-Tools)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Simulate and evaluate real-time friction, FX spread basis points, and correspondent hops.
          </p>
        </div>
        <Link
          href="/routing"
          className="px-5 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Open Corridor Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
