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
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Network className="w-6 h-6 text-[#0070e0]" />
          <span>Google OR-Tools Interbank Routing Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mixed-Integer Linear Programming (MILP) solver optimizing correspondent banking hops over liquidity reserves, FX spread margins, and settlement cutoff windows.
        </p>
      </div>

      {/* Simulator Inputs */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Play className="w-4 h-4 text-[#0070e0]" />
            <span>Corridor Solver Parameters</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Constraints: Liquidity, Cutoff, FX Spread</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Origin Institution</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium"
            >
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Beneficiary Institution</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium"
            >
              <option value="EUROT_DE">EUROT_DE (EuroTransact AG)</option>
              <option value="PACIFIC_SG">PACIFIC_SG (Pacific Rim Financial)</option>
              <option value="GSB_US">GSB_US (Global Settlement Bank)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Transfer Amount (USD)</label>
            <input
              type="number"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0070e0]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Optimization Goal</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0070e0] font-medium"
            >
              <option value="BALANCED">Balanced Cost & Speed</option>
              <option value="LEAST_COST">Min-Cost Corridor</option>
              <option value="FASTEST">Lowest Settlement Time</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#0070e0] hover:bg-[#005cb8] text-white flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Solving Linear Program...' : 'Calculate Optimal Corridor'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {routeResult && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Optimal Route Result (Status: {routeResult.status})</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Solver: Google OR-Tools CBC/SCIP
            </span>
          </div>

          <RouteVisualizer
            routeNodes={routeResult.route}
            totalCostUSD={routeResult.total_cost_usd}
            estimatedMinutes={routeResult.estimated_minutes}
            reasoning={routeResult.reasoning}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correspondent Hops</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">{routeResult.route?.length} Nodes</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Transfer Fee</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">${routeResult.breakdown?.base_fee_usd?.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FX Spread Friction</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">${routeResult.breakdown?.fx_spread_cost_usd?.toFixed(2)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effective Spread</span>
              <span className="text-lg font-bold text-slate-900 block mt-0.5">{routeResult.breakdown?.fx_spread_bps} bps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
