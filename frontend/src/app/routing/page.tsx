'use client';

import React, { useState } from 'react';
import {
  Network,
  ArrowRight,
  Clock,
  DollarSign,
  Building,
  Play,
  CheckCircle2,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import RouteVisualizer from '../../components/RouteVisualizer';

export default function RoutingPage() {
  const [source, setSource] = useState('GSB_US');
  const [destination, setDestination] = useState('EUROT_DE');
  const [amount, setAmount] = useState<number>(75000);
  const [priority, setPriority] = useState('BALANCED');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (source === destination) {
      alert('Source and destination cannot be identical.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/routing/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_bank: source,
          destination_bank: destination,
          amount: Number(amount),
          currency: 'USD',
          priority,
        }),
      });
      const data = await res.json();
      setRouteResult(data);
    } catch (e: any) {
      alert(`Routing optimization error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-white/[0.08]">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Network className="w-5 h-5 text-violet-400" />
          <span>Google OR-Tools Interbank Routing Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Mixed-Integer Linear Programming (MILP) solver optimizing correspondent banking hops over liquidity reserves, FX spread margins, and settlement cutoff windows.
        </p>
      </div>

      {/* Simulator Inputs */}
      <div className="p-6 rounded-2xl bg-[#10121d] border border-white/[0.08] shadow-card-dark space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-violet-400" />
            <span>Corridor Solver Parameters</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Constraints: Liquidity, Cutoff, FX Spread</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Origin Institution</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Beneficiary Institution</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Transfer Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Objective Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
            >
              <option value="BALANCED">Balanced (Cost + Time)</option>
              <option value="SPEED">Speed First (Min Minutes)</option>
              <option value="COST">Cost First (Min Fees)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? 'Solving Corridor Matrix...' : 'Run OR-Tools Solver'}</span>
          </button>
        </div>
      </div>

      {/* Solver Results */}
      {routeResult && (
        <div className="p-6 rounded-2xl bg-[#10121d] border border-white/[0.08] shadow-card-dark space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Optimal Route Selected</span>
            </h3>
            <span className="text-xs font-mono text-violet-300">
              Solver Time: {routeResult.solver_time_ms ? `${routeResult.solver_time_ms.toFixed(1)}ms` : '<2ms'}
            </span>
          </div>

          <RouteVisualizer
            nodes={routeResult.selected_route || []}
            costUSD={routeResult.estimated_cost_usd}
            estimatedMinutes={routeResult.estimated_minutes}
            reasoning={routeResult.reasoning}
          />

          {routeResult.candidate_routes && (
            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-300 block">
                Evaluated Alternative Corridors:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {routeResult.candidate_routes.map((cand: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-[#141726] border border-white/[0.04] space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-white font-bold">{cand.path.join(' → ')}</span>
                      <span className="text-slate-400">${cand.cost_usd}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Window: {cand.time_minutes}m • Liquidity Score: {(cand.liquidity_score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
