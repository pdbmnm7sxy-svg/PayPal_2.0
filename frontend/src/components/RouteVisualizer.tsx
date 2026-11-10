'use client';

import React from 'react';
import { Network, ArrowRight, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

interface RouteVisualizerProps {
  nodes: string[];
  costUSD?: number | string;
  estimatedMinutes?: number | string;
  reasoning?: string;
}

export default function RouteVisualizer({
  nodes,
  costUSD,
  estimatedMinutes,
  reasoning,
}: RouteVisualizerProps) {
  const getBankMeta = (code: string) => {
    switch (code) {
      case 'GSB_US':
        return { name: 'Global Settlement Bank', country: 'US', rail: 'Fedwire' };
      case 'EUROT_DE':
        return { name: 'EuroTransact AG', country: 'DE', rail: 'Target2' };
      case 'PACIFIC_SG':
        return { name: 'Pacific Rim Financial', country: 'SG', rail: 'MEPS+' };
      case 'INT_LDN':
        return { name: 'London Clearing Intermediary', country: 'UK', rail: 'CHAPS/FX' };
      case 'INT_TOK':
        return { name: 'Tokyo Clearing Intermediary', country: 'JP', rail: 'FXYCS' };
      default:
        return { name: code, country: 'CORR', rail: 'SWIFT/RTGS' };
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#141726] border border-white/[0.08] shadow-card-dark space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white tracking-tight">
            OR-Tools Optimized Corridor Path
          </span>
        </div>
        <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full">
          MILP Solved
        </span>
      </div>

      {/* Nodes Horizontal Flow */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
        {nodes.map((node, index) => {
          const meta = getBankMeta(node);
          const isLast = index === nodes.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={index}>
              <div
                className={`p-3 rounded-xl border flex flex-col min-w-[130px] shrink-0 transition-all ${
                  isFirst || isLast
                    ? 'bg-[#181c2f] border-violet-500/30 text-white'
                    : 'bg-[#10121d] border-white/[0.06] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">{node}</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                    {meta.country}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 truncate">{meta.name}</span>
                <span className="text-[10px] font-mono text-violet-400 mt-1">{meta.rail}</span>
              </div>

              {!isLast && (
                <div className="flex flex-col items-center justify-center shrink-0 px-1">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Metrics breakdown */}
      {(costUSD !== undefined || estimatedMinutes !== undefined) && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Hop Fees:</span>
            <span className="font-bold text-white font-mono">
              ${Number(costUSD).toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Estimated Window:</span>
            <span className="font-bold text-white font-mono">
              ~{estimatedMinutes} mins
            </span>
          </div>
        </div>
      )}

      {reasoning && (
        <p className="text-[11px] text-slate-400 italic bg-[#0f111d] p-2.5 rounded-lg border border-white/[0.04]">
          &ldquo;{reasoning}&rdquo;
        </p>
      )}
    </div>
  );
}
