'use client';

import React, { useState } from 'react';
import {
  Route,
  Zap,
  ArrowRight,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
  Sparkles,
  Sliders,
  Layers,
} from 'lucide-react';
import RouteVisualizer from '../../components/RouteVisualizer';

export default function SpatialRoutingPage() {
  const [source, setSource] = useState('GSB_US');
  const [destination, setDestination] = useState('EUROT_DE');
  const [amount, setAmount] = useState<number>(100000);
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase font-bold">
              Spatial Solver
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              Google OR-Tools MILP Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Interbank Corridor Optimization Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mixed-Integer Linear Programming solver evaluating correspondent liquidity pools, FX spread slippage, and RTGS cutoff windows.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-glow-violet active:scale-95 shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>{loading ? 'Solving Corridor Matrix...' : 'Execute OR-Tools Solver'}</span>
        </button>
      </div>

      {/* 2-Pane Spatial Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Constraints & Objectives (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-violet-400" />
              Solver Parameters
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CONSTRAINTS</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Source Institution
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              >
                <option value="GSB_US">GSB_US (Global Settlement Bank, US)</option>
                <option value="EUROT_DE">EUROT_DE (EuroTransact AG, DE)</option>
                <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial, SG)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Target Institution
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              >
                <option value="EUROT_DE">EUROT_DE (EuroTransact AG, DE)</option>
                <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial, SG)</option>
                <option value="GSB_US">GSB_US (Global Settlement Bank, US)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Ticket Size (USD Equiv)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-space-850 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-violet-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                Objective Weighting
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'BALANCED', label: 'Balanced' },
                  { id: 'SPEED', label: 'Fastest' },
                  { id: 'COST', label: 'Lowest Fee' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold font-mono border transition-all ${
                      priority === p.id
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-glow-violet'
                        : 'bg-space-850 border-white/[0.06] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Solved Route Visualizer & Candidate Matrix (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Route className="w-4 h-4 text-cyan-400" />
              MILP Route Topology &amp; Candidates
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">SOLVER VERIFIED</span>
          </div>

          {routeResult ? (
            <div className="space-y-5">
              <RouteVisualizer
                nodes={routeResult.selected_route || []}
                costUSD={routeResult.estimated_cost_usd}
                estimatedMinutes={routeResult.estimated_minutes}
                reasoning={routeResult.reasoning}
              />

              {routeResult.candidate_routes && (
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Evaluated Correspondent Paths:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {routeResult.candidate_routes.map((cand: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-space-850 border border-white/[0.06] space-y-1.5 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">{cand.path.join(' → ')}</span>
                          <span className="text-emerald-400 font-bold">${cand.cost_usd}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Estimated Window: ~{cand.time_minutes} min • Liquidity Score: {(cand.liquidity_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-space-850 border border-white/[0.04] text-center space-y-2">
              <Route className="w-8 h-8 text-violet-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Click &ldquo;Execute OR-Tools Solver&rdquo;</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Run the Python/FastAPI mixed-integer linear programming engine to compute optimal correspondent paths across bilateral Nostro reserves.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
