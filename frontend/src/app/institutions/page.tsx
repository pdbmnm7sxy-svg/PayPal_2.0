'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  DollarSign,
  Send,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BankNode } from '../../types';
import { api } from '../../lib/api';

export default function InstitutionsMeshPage() {
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
        return {
          rail: 'Fedwire / CHIPS (US RTGS)',
          cutOff: '17:00 EST',
          status: 'Optimal',
          color: '#8b5cf6',
          peers: ['EUROT_DE', 'PACIFIC_SG'],
        };
      case 'EUROT_DE':
        return {
          rail: 'Target2 / EURO1 (ECB RTGS)',
          cutOff: '18:00 CET',
          status: 'Optimal',
          color: '#06b6d4',
          peers: ['GSB_US', 'PACIFIC_SG'],
        };
      case 'PACIFIC_SG':
        return {
          rail: 'MEPS+ (MAS RTGS)',
          cutOff: '19:00 SGT',
          status: 'Optimal',
          color: '#10b981',
          peers: ['GSB_US', 'EUROT_DE'],
        };
      default:
        return {
          rail: 'Correspondent Commercial Clearing',
          cutOff: '24/7 Continuous',
          status: 'Active',
          color: '#f59e0b',
          peers: ['ALL'],
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase font-bold">
              Orbital Mesh
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              3/3 Clearing Nodes Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Consortium Clearing Nodes &amp; Nostro Reserves
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Decentralized reserve balances, central bank RTGS clearing interfaces, and real-time corridor throughput.
          </p>
        </div>

        <Link
          href="/transfers/new"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-violet transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Originate Transfer</span>
        </Link>
      </div>

      {/* Grid of 3 Interconnected Clearing Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {banks.map((bank) => {
          const rail = getRailInfo(bank.code);
          return (
            <div
              key={bank.code}
              className="p-6 rounded-3xl bg-space-900 border border-white/10 hover:border-violet-500/40 shadow-card-dark transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl group-hover:bg-violet-600/10 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: rail.color, color: rail.color }}
                    />
                    <span className="font-mono text-xs font-extrabold text-white">
                      {bank.code}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    {rail.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4 font-sans">
                  {bank.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Jurisdiction: {bank.country} • Currency: {bank.currency}
                </p>

                <div className="mt-5 p-4 rounded-2xl bg-space-850 border border-white/[0.06] space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Available Reserve:</span>
                    <span className="font-bold text-white text-sm">
                      {bank.currency} {(Number(bank.liquidityBalance) / 1000000).toFixed(2)}M
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Daily RTGS Cut-Off:</span>
                    <span className="text-violet-300 font-bold">{rail.cutOff}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Settlement Interface:</span>
                    <span className="text-slate-200">{rail.rail}</span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Direct Corridors: {rail.peers.join(' ⇄ ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06]">
                <Link
                  href={`/transfers/new?sender=${bank.code}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-space-850 hover:bg-violet-600/20 hover:border-violet-500/50 border border-white/[0.08] text-violet-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-glow-violet"
                >
                  <span>Launch Wire From {bank.code}</span>
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
