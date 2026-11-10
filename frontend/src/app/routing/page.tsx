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
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Network className="w-6 h-6 text-purple-400" />
          <span>Google OR-Tools Interbank Routing Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Mixed-Integer Linear Programming solver optimizing correspondent banking hops over liquidity pools, FX spread basis points, and settlement cutoff windows.
        </p>
      </div>

      {/* Simulator Inputs */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-purple-400" />
          <span>Corridor Solver Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Origin Institution</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Beneficiary Institution</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Transfer Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Solver Objective</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="BALANCED">Balanced (Cost + Latency)</option>
              <option value="LOW_COST">Low Cost (Minimize Friction)</option>
              <option value="FASTEST">Fastest (Minimize Cutoff Time)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 font-mono shadow-lg shadow-purple-600/20"
          >
            <Network className="w-3.5 h-3.5" />
            <span>{loading ? 'Solving MIP Model...' : 'Compute Optimal Route'}</span>
          </button>
        </div>

        {/* Visual Route Output */}
        {routeResult && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <RouteVisualizer
              routeNodes={routeResult.optimal_route.path}
              totalCostUSD={routeResult.optimal_route.total_cost_usd}
              estimatedMinutes={routeResult.optimal_route.total_estimated_minutes}
              reasoning={routeResult.decision_summary}
            />

            {/* Individual Hop Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase font-mono">
                Rail Hop Breakdown & Liquidity Constraints:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {routeResult.optimal_route.hops.map((h: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-1">
                    <div className="flex justify-between items-center text-white font-bold">
                      <span>Hop {i + 1}: {h.from_node} → {h.to_node}</span>
                      <span className="text-emerald-400">${h.total_hop_cost_usd.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Rail: {h.settlement_channel}</div>
                    <div className="text-[11px] text-slate-400">Fixed Fee: ${h.fixed_fee_usd} • Spread: {h.fx_spread_bps} bps</div>
                    <div className="text-[10px] text-slate-400">Liquidity Buffer: ${(h.liquidity_available_usd / 1000000).toFixed(1)}M</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative Candidate Routes */}
            {routeResult.alternative_routes?.length > 0 && (
              <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-700/40 space-y-2 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block font-semibold">
                  Alternative Candidate Corridors Evaluated by Solver:
                </span>
                {routeResult.alternative_routes.map((alt: any, i: number) => (
                  <div key={i} className="text-slate-300 text-[11px]">
                    • <span className="text-white font-bold">{alt.path.join(' → ')}</span>: ${alt.total_cost_usd.toFixed(2)} USD, {alt.total_estimated_minutes} min ({alt.selection_reason})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
