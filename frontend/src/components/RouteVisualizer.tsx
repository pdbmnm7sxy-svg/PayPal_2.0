'use client';

import React from 'react';
import { Network, ArrowRight, Clock, DollarSign, Layers } from 'lucide-react';

interface RouteVisualizerProps {
  routeNodes: string[];
  totalCostUSD: number;
  estimatedMinutes: number;
  reasoning?: string;
}

const BANK_LABELS: Record<string, { name: string; country: string }> = {
  GSB_US: { name: 'Global Settlement Bank', country: 'USA' },
  EUROT_DE: { name: 'EuroTransact AG', country: 'Germany/EU' },
  PACIFIC_SG: { name: 'Pacific Rim Financial', country: 'Singapore' },
  INT_LDN: { name: 'London Interbank Hub', country: 'UK' },
  INT_TOK: { name: 'Tokyo Gateway', country: 'Japan' },
  INT_ZUR: { name: 'Zurich Intermediary', country: 'Switzerland' },
};

export default function RouteVisualizer({
  routeNodes,
  totalCostUSD,
  estimatedMinutes,
  reasoning,
}: RouteVisualizerProps) {
  if (!routeNodes || routeNodes.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-800/40 text-center text-xs text-slate-400 font-mono">
        No correspondent route computed.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Network className="w-4 h-4 text-purple-400" />
          <span>Google OR-Tools Optimized Settlement Route</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
            <DollarSign className="w-3 h-3" />
            ${totalCostUSD.toFixed(2)} Friction
          </span>
          <span className="flex items-center gap-1 text-sky-400 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            {estimatedMinutes} min ETA
          </span>
        </div>
      </div>

      {/* Visual Corridor Flow */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto">
        {routeNodes.map((node, index) => {
          const bank = BANK_LABELS[node] || { name: node, country: 'CORRESPONDENT' };
          const isIntermediary = node.startsWith('INT_');
          const isLast = index === routeNodes.length - 1;

          return (
            <React.Fragment key={node + index}>
              <div
                className={`flex-1 min-w-[140px] p-2.5 rounded-lg border text-center transition-all ${
                  isIntermediary
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  {isIntermediary ? 'Clearing Hub' : index === 0 ? 'Origin Bank' : 'Beneficiary Bank'}
                </div>
                <div className="text-xs font-bold font-mono mt-0.5 text-brand-300">{node}</div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">{bank.name}</div>
                <div className="text-[9px] text-slate-400">{bank.country}</div>
              </div>

              {!isLast && (
                <div className="flex flex-col items-center justify-center text-slate-400 px-1 shrink-0">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">Rail Hop</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Optimization Reason */}
      {reasoning && (
        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed font-mono">
          <span className="text-purple-400 font-semibold uppercase tracking-wider block text-[10px] mb-0.5">
            Solver Decision Rationale:
          </span>
          {reasoning}
        </div>
      )}
    </div>
  );
}
