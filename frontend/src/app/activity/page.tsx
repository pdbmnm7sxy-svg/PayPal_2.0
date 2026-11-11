'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Sparkles,
  Table as TableIcon,
  ListFilter,
  Layers,
  FileText,
} from 'lucide-react';
import { Payment } from '../../types';
import { api } from '../../lib/api';
import TransactionTable from '../../components/TransactionTable';
import TransferDrawer from '../../components/TransferDrawer';

export default function ActivityGazettePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SETTLED' | 'PENDING' | 'HELD'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'EUR' | 'SGD'>('ALL');
  const [viewMode, setViewMode] = useState<'GAZETTE' | 'GRID'>('GAZETTE');

  useEffect(() => {
    api
      .getPayments()
      .then((res) => {
        setPayments(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load gazette activity:', err);
        setLoading(false);
      });
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiverBank.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'SETTLED') {
        matchesStatus = p.status === 'SETTLED' || p.status === 'RECONCILED';
      } else if (statusFilter === 'PENDING') {
        matchesStatus =
          p.status === 'DRAFT' ||
          p.status === 'RISK_CHECKED' ||
          p.status === 'FUNDED_PAYPAL' ||
          p.status === 'FUNDED_SIMULATED' ||
          p.status === 'ROUTED' ||
          p.status === 'SETTLEMENT_PENDING';
      } else if (statusFilter === 'HELD') {
        matchesStatus = p.status === 'RISK_HELD' || p.status === 'SETTLEMENT_FAILED';
      }

      const matchesCurrency =
        currencyFilter === 'ALL' || p.currency === currencyFilter;

      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [payments, searchQuery, statusFilter, currencyFilter]);

  // Featured dossier item (e.g. first held item or first item)
  const featuredDossier = useMemo(() => {
    return filteredPayments.find((p) => p.status === 'RISK_HELD') || filteredPayments[0] || null;
  }, [filteredPayments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Broadsheet Masthead */}
      <div className="border-b-2 border-white/20 pb-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              TRANSNATIONAL CHRONICLE // VOLUME 2026.11
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mt-1 font-editorial uppercase">
              The Settlement Gazette
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Consortium Ledger State &amp; Interbank Payment Records Stream
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-900 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('GAZETTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'GAZETTE'
                  ? 'bg-violet-600 text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Broadsheet</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'GRID'
                  ? 'bg-violet-600 text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Full AG Grid</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filter Ticker */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search reference, institution, counterparty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-space-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'SETTLED', 'PENDING', 'HELD'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                  statusFilter === st
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-bold'
                    : 'bg-space-900 border-white/[0.06] text-slate-400 hover:border-white/20'
                }`}
              >
                {st}
              </button>
            ))}

            {(['ALL', 'USD', 'EUR', 'SGD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                  currencyFilter === curr
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-space-900 border-white/[0.06] text-slate-400 hover:border-white/20'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'GRID' ? (
        <TransactionTable
          payments={filteredPayments}
          onSelectPayment={(p) => setSelectedPayment(p)}
          title="Consortium Clearing Records"
          subtitle={`Auditing ${filteredPayments.length} transactions through AG Grid Community`}
        />
      ) : (
        /* Asymmetric Editorial Broadsheet Layout (Concept B) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Featured Investigation Dossier (5 cols) */}
          {featuredDossier && (
            <div className="lg:col-span-5 p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold">
                  01 // CASE DOSSIER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  {featuredDossier.status}
                </span>
              </div>

              <div>
                <span className="font-mono text-xs text-slate-400 block">
                  REF: {featuredDossier.reference}
                </span>
                <h3 className="text-xl font-black text-white font-editorial mt-1 leading-tight">
                  {featuredDossier.senderName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Route: {featuredDossier.senderBank} ({featuredDossier.senderCountry}) → {featuredDossier.receiverBank} ({featuredDossier.receiverCountry})
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-space-850 border border-white/[0.06] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Principal Volume:</span>
                  <span className="text-white font-bold">
                    {featuredDossier.currency} {Number(featuredDossier.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Settlement:</span>
                  <span className="text-emerald-400 font-bold">
                    {featuredDossier.targetCurrency} {Number(featuredDossier.targetAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">LightGBM Fraud Score:</span>
                  <span className="text-rose-400 font-bold">
                    {(Number(featuredDossier.fraudScore) * 100).toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fabric Block Cert:</span>
                  <span className="text-violet-300">
                    {featuredDossier.fabricBlockHash ? `${featuredDossier.fabricBlockHash.substring(0, 10)}...` : 'Pending'}
                  </span>
                </div>
              </div>

              {featuredDossier.routeReasoning && (
                <blockquote className="p-3.5 rounded-xl bg-space-850 border-l-2 border-violet-500 text-xs text-slate-300 italic font-sans leading-relaxed">
                  &ldquo;{featuredDossier.routeReasoning}&rdquo;
                </blockquote>
              )}

              <button
                onClick={() => setSelectedPayment(featuredDossier)}
                className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-glow-violet"
              >
                <span>Inspect Full Case Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right Column: Editorial Record Ledger Stream (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                02 // CHRONOLOGICAL LEDGER DISPATCHES
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredPayments.length} Verified Entries
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredPayments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPayment(p)}
                  className="p-4 rounded-2xl bg-space-900 hover:bg-space-850 border border-white/[0.06] hover:border-violet-500/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-space-800 border border-white/[0.08] flex items-center justify-center font-mono font-bold text-xs text-violet-300 shrink-0 group-hover:scale-105 transition-transform">
                      {p.currency}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate group-hover:text-violet-300 transition-colors font-sans">
                          {p.senderName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {p.senderBank} → {p.receiverBank}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {p.reference} • {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-white">
                      {p.currency} {Number(p.amount).toLocaleString()}
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                        p.status === 'SETTLED' || p.status === 'RECONCILED'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : p.status === 'RISK_HELD'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spatial Transaction Details Drawer */}
      <TransferDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onUpdate={(updated) => {
          setSelectedPayment(updated);
          setPayments((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
        }}
      />
    </div>
  );
}
