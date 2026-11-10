'use client';

import React from 'react';
import { Network, ArrowRight, Clock, DollarSign } from 'lucide-react';

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
      <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-mono border border-slate-200">
        No correspondent route computed.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-[#0070e0]" />
          <span>Google OR-Tools Optimized Route</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            ${totalCostUSD.toFixed(2)} Friction
          </span>
          <span className="flex items-center gap-1 text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
            <Clock className="w-3 h-3 text-slate-400" />
            {estimatedMinutes}m ETA
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
                className={`flex-1 min-w-[140px] p-2.5 rounded-xl border text-center transition-all ${
                  isIntermediary
                    ? 'bg-blue-50/70 border-blue-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  {isIntermediary ? 'Clearing Hub' : index === 0 ? 'Origin Bank' : 'Beneficiary'}
                </div>
                <div className="text-xs font-bold mt-0.5 text-[#0070e0] font-mono">{node}</div>
                <div className="text-[11px] text-slate-700 font-medium truncate mt-0.5">{bank.name}</div>
                <div className="text-[10px] text-slate-400">{bank.country}</div>
              </div>

              {!isLast && (
                <div className="flex flex-col items-center justify-center text-slate-400 px-1 shrink-0">
                  <ArrowRight className="w-4 h-4 text-[#0070e0]" />
                  <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Hop</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Optimization Reason */}
      {reasoning && (
        <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
          <span className="text-[#0070e0] font-bold uppercase tracking-wider block text-[10px] mb-0.5">
            MIP Solver Decision Rationale:
          </span>
          {reasoning}
        </div>
      )}
    </div>
  );
}
