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
    api
      .getBanks()
      .then((res) => {
        setBanks(res);
        setLoading(false);
      })
      .catch((err) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            <span>Consortium Member Institutions &amp; Clearing Nodes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permissioned financial participants, Nostro/Vostro liquidity balances, and central bank RTGS settlement rails.
          </p>
        </div>

        <Link
          href="/transfers/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 shrink-0"
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
              className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-6 shadow-card-dark hover:border-violet-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                    {bank.code}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {rail.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">
                  {bank.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jurisdiction: {bank.country} • Currency: {bank.currency}
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/[0.06] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Reserves:</span>
                    <span className="font-bold text-white font-mono">
                      {bank.currency} {(Number(bank.liquidityBalance) / 1000000).toFixed(2)}M
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Clearing Rail:</span>
                    <span className="font-medium text-slate-300">{rail.rail}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily RTGS Cutoff:</span>
                    <span className="font-mono text-violet-300">{rail.cutOff}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06]">
                <Link
                  href={`/transfers/new?sender=${bank.code}`}
                  className="w-full py-2 rounded-xl bg-[#141726] hover:bg-violet-600/20 hover:border-violet-500/40 border border-white/[0.08] text-violet-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Originate Wire From {bank.code}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
