'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Radio,
  Zap,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
  Building,
  Activity,
  Layers,
} from 'lucide-react';
import { BankNode, Payment } from '../types';

interface OrbitalUniverseViewProps {
  banks: BankNode[];
  payments: Payment[];
  onSelectPayment: (payment: Payment) => void;
}

export default function OrbitalUniverseView({
  banks,
  payments,
  onSelectPayment,
}: OrbitalUniverseViewProps) {
  const [selectedBankCode, setSelectedBankCode] = useState<string>('GSB_US');

  // Compute total liquidity
  const totalLiquidityUSD = banks.reduce((sum, b) => {
    const bal = Number(b.liquidityBalance) || 0;
    if (b.currency === 'USD') return sum + bal;
    if (b.currency === 'EUR') return sum + bal * 1.08;
    if (b.currency === 'SGD') return sum + bal * 0.74;
    return sum + bal;
  }, 0);

  const bankNodes = [
    {
      code: 'GSB_US',
      name: 'Global Settlement Bank',
      city: 'New York',
      country: 'US',
      currency: 'USD',
      reserve: '$25,000,000',
      rail: 'Fedwire RTGS',
      cutOff: '17:00 EST',
      status: 'Optimal',
      color: '#8b5cf6', // Violet
      cx: 180,
      cy: 280,
    },
    {
      code: 'EUROT_DE',
      name: 'EuroTransact AG',
      city: 'Frankfurt',
      country: 'DE',
      currency: 'EUR',
      reserve: '€18,500,000',
      rail: 'Target2 Clearing',
      cutOff: '18:00 CET',
      status: 'Optimal',
      color: '#06b6d4', // Cyan
      cx: 480,
      cy: 110,
    },
    {
      code: 'PACIFIC_SG',
      name: 'Pacific Rim Financial',
      city: 'Singapore',
      country: 'SG',
      currency: 'SGD',
      reserve: 'S$34,000,000',
      rail: 'MEPS+ Bilateral',
      cutOff: '19:00 SGT',
      status: 'Optimal',
      color: '#10b981', // Emerald
      cx: 780,
      cy: 310,
    },
  ];

  const activeBank = bankNodes.find((b) => b.code === selectedBankCode) || bankNodes[0];

  // In-flight transactions for display along corridors
  const inFlightPayments = payments.filter(
    (p) =>
      p.status === 'SETTLEMENT_PENDING' ||
      p.status === 'ROUTED' ||
      p.status === 'FUNDED_PAYPAL' ||
      p.status === 'RISK_HELD'
  );

  return (
    <div className="relative w-full rounded-3xl bg-space-900 border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Background radial cosmic glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cosmic-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Universe Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold uppercase tracking-wider">
              Settlement Universe
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Orbital Topology Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Global Liquidity Vortex &amp; Corridor Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual trajectory stream of wholesale payments orbiting between consortium central clearing banks.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-space-850 border border-white/[0.08] text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Consortium Reserves
            </span>
            <span className="text-xl font-extrabold text-white font-mono tracking-tight">
              ${(totalLiquidityUSD / 1000000).toFixed(2)}M
            </span>
          </div>

          <Link
            href="/transfers/new"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow-violet transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>New Wire</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Orbital Viewport (Cinematic SVG & Floating Nodes) */}
      <div className="relative z-10 mt-6 min-h-[460px] sm:min-h-[500px] flex items-center justify-center">
        {/* SVG Orbital Canvas */}
        <svg
          viewBox="0 0 960 480"
          className="w-full h-full max-h-[500px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="vortex-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#040507" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="orbit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="orbit-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="orbit-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Central Concentric Orbital Rings */}
          <circle cx="480" cy="240" r="220" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="480" cy="240" r="160" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
          <circle cx="480" cy="240" r="100" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1.5" strokeDasharray="8 4" />
          <circle cx="480" cy="240" r="70" fill="url(#vortex-glow)" />

          {/* Central Liquidity Core Label */}
          <g transform="translate(480, 240)" textAnchor="middle">
            <circle r="36" fill="#0c0e18" stroke="rgba(139,92,246,0.5)" strokeWidth="2" filter="drop-shadow(0 0 15px rgba(139,92,246,0.5))" />
            <text y="-5" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              POOL
            </text>
            <text y="10" fill="#a78bfa" fontSize="9" fontWeight="bold" fontFamily="monospace">
              $57.0M
            </text>
          </g>

          {/* Corridors (Curved Bezier Trajectories) */}
          {/* Corridor US -> DE */}
          <path
            d="M 240 250 Q 340 140 430 130"
            fill="none"
            stroke="url(#orbit-grad-1)"
            strokeWidth="2.5"
            className="animate-trajectory"
          />
          {/* Corridor DE -> SG */}
          <path
            d="M 530 130 Q 640 180 720 280"
            fill="none"
            stroke="url(#orbit-grad-2)"
            strokeWidth="2.5"
            className="animate-trajectory"
          />
          {/* Corridor SG -> US */}
          <path
            d="M 720 320 Q 480 430 240 290"
            fill="none"
            stroke="url(#orbit-grad-3)"
            strokeWidth="2.5"
            className="animate-trajectory-fast"
          />
        </svg>

        {/* Bank 1 Node: GSB_US (New York) */}
        <div
          onClick={() => setSelectedBankCode('GSB_US')}
          className={`absolute left-[5%] sm:left-[10%] top-[45%] -translate-y-1/2 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedBankCode === 'GSB_US'
              ? 'glass-panel border-violet-500 shadow-glow-violet scale-105 z-20'
              : 'bg-space-850/90 border border-white/10 hover:border-violet-500/50 hover:scale-102 z-10'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
              <span className="font-mono text-xs font-extrabold text-white">GSB_US</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">
              USD
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200 mt-2">New York Hub</div>
          <div className="text-[11px] font-mono text-violet-300 mt-0.5">$25,000,000</div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">Rail: Fedwire RTGS</div>
        </div>

        {/* Bank 2 Node: EUROT_DE (Frankfurt) */}
        <div
          onClick={() => setSelectedBankCode('EUROT_DE')}
          className={`absolute left-1/2 -translate-x-1/2 top-[5%] p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedBankCode === 'EUROT_DE'
              ? 'glass-panel border-cyan-500 shadow-glow-cyan scale-105 z-20'
              : 'bg-space-850/90 border border-white/10 hover:border-cyan-500/50 hover:scale-102 z-10'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="font-mono text-xs font-extrabold text-white">EUROT_DE</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              EUR
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200 mt-2">Frankfurt Hub</div>
          <div className="text-[11px] font-mono text-cyan-300 mt-0.5">€18,500,000</div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">Rail: Target2 RTGS</div>
        </div>

        {/* Bank 3 Node: PACIFIC_SG (Singapore) */}
        <div
          onClick={() => setSelectedBankCode('PACIFIC_SG')}
          className={`absolute right-[5%] sm:right-[10%] top-[50%] -translate-y-1/2 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            selectedBankCode === 'PACIFIC_SG'
              ? 'glass-panel border-emerald-500 shadow-glow-emerald scale-105 z-20'
              : 'bg-space-850/90 border border-white/10 hover:border-emerald-500/50 hover:scale-102 z-10'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-xs font-extrabold text-white">PACIFIC_SG</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              SGD
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-200 mt-2">Singapore Hub</div>
          <div className="text-[11px] font-mono text-emerald-300 mt-0.5">S$34,000,000</div>
          <div className="mt-2 text-[10px] font-mono text-slate-400">Rail: MEPS+ Bilateral</div>
        </div>

        {/* Floating Active Trajectory Badges */}
        {inFlightPayments.slice(0, 3).map((p, idx) => (
          <div
            key={p.id}
            onClick={() => onSelectPayment(p)}
            style={{
              left: idx === 0 ? '34%' : idx === 1 ? '60%' : '48%',
              top: idx === 0 ? '32%' : idx === 1 ? '42%' : '76%',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 animate-float"
          >
            <div className="px-3 py-1.5 rounded-xl bg-space-950/90 border border-violet-500/50 text-[11px] font-mono shadow-glow-violet hover:scale-110 transition-all flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-white font-bold">{p.reference.substring(0, 11)}</span>
              <span className="text-slate-400">{p.currency} {Number(p.amount) / 1000}k</span>
              {p.status === 'RISK_HELD' ? (
                <span className="text-rose-400 font-bold ml-1">HELD</span>
              ) : (
                <span className="text-emerald-400 font-bold ml-1">TRANSIT</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Telemetry HUD Strip */}
      <div className="relative z-10 mt-4 p-4 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-violet-400">
            <Radio className="w-4 h-4 text-violet-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-sans">
                {activeBank.name} ({activeBank.code})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                {activeBank.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Clearing Jurisdiction: {activeBank.city}, {activeBank.country} • Cut-off: {activeBank.cutOff}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Reserve Balance</span>
            <span className="text-white font-bold">{activeBank.reserve}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">RTGS Interface</span>
            <span className="text-violet-300 font-bold">{activeBank.rail}</span>
          </div>
          <Link
            href={`/transfers/new?sender=${activeBank.code}`}
            className="px-3.5 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600 border border-violet-500/50 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <span>Launch Wire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
