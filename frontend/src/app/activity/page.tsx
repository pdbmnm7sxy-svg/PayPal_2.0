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
  Send,
  Building,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  ListFilter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Payment } from '../../types';
import { api } from '../../lib/api';
import TransactionTable from '../../components/TransactionTable';
import TransferDrawer from '../../components/TransferDrawer';

export default function ActivityPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SETTLED' | 'PENDING' | 'HELD'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'EUR' | 'SGD'>('ALL');
  const [dateRange, setDateRange] = useState<'90_DAYS' | '30_DAYS' | 'ALL'>('90_DAYS');
  const [viewMode, setViewMode] = useState<'FEED' | 'GRID'>('FEED');

  useEffect(() => {
    api
      .getPayments()
      .then((res) => {
        setPayments(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load activity:', err);
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

  // Group filtered payments chronologically
  const groupedPayments = useMemo(() => {
    const today: Payment[] = [];
    const thisWeek: Payment[] = [];
    const earlier: Payment[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    filteredPayments.forEach((p) => {
      const pDate = new Date(p.createdAt);
      const diff = now.getTime() - pDate.getTime();
      if (diff < oneDay) {
        today.push(p);
      } else if (diff < sevenDays) {
        thisWeek.push(p);
      } else {
        earlier.push(p);
      }
    });

    return { today, thisWeek, earlier };
  }, [filteredPayments]);

  const renderPaymentItem = (payment: Payment) => {
    const isSettled = payment.status === 'SETTLED' || payment.status === 'RECONCILED';
    const isHeld = payment.status === 'RISK_HELD' || payment.status === 'SETTLEMENT_FAILED';
    const isPending = !isSettled && !isHeld;

    return (
      <div
        key={payment.id}
        onClick={() => setSelectedPayment(payment)}
        className="p-4 rounded-xl bg-[#121422] hover:bg-[#16192b] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-card-dark"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-transform group-hover:scale-105 ${
              isSettled
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : isHeld
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                : 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
            }`}
          >
            {payment.currency}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                {payment.senderName}
              </span>
              <span className="text-[10px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] font-mono">
                {payment.senderBank} → {payment.receiverBank}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{payment.reference}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-white font-mono">
            {payment.currency} {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] mt-0.5">
            <span
              className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] ${
                isSettled
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : isHeld
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              {payment.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Transfers &amp; Settlement Activity
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical payment ledger with real-time state tracking, PayPal Sandbox verification, and Fabric block certification.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-[#10121d] p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setViewMode('FEED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'FEED'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'GRID'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>AG Grid Table</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-card-dark space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by counterparty name, reference ID, or bank code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141726] border border-white/[0.08] text-xs text-white rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-violet-500/50 focus:bg-[#181c2f] transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Filter by:
          </span>

          {/* Date Filter */}
          <button
            onClick={() =>
              setDateRange(
                dateRange === '90_DAYS' ? '30_DAYS' : dateRange === '30_DAYS' ? 'ALL' : '90_DAYS',
              )
            }
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#141726] border border-white/[0.08] text-slate-200 hover:border-violet-500/40 transition-all flex items-center gap-1.5"
          >
            <Clock className="w-3 h-3 text-violet-400" />
            <span>
              Date:{' '}
              {dateRange === '90_DAYS'
                ? 'Last 90 days'
                : dateRange === '30_DAYS'
                ? 'Last 30 days'
                : 'All Time'}
            </span>
          </button>

          {/* Status Filter Pills */}
          {(['ALL', 'SETTLED', 'PENDING', 'HELD'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                statusFilter === st
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300 font-semibold shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                  : 'bg-[#141726] border-white/[0.08] text-slate-300 hover:border-white/20'
              }`}
            >
              Status: {st}
            </button>
          ))}

          {/* Currency Filter Pills */}
          {(['ALL', 'USD', 'EUR', 'SGD'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrencyFilter(curr)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                currencyFilter === curr
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300 font-semibold shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                  : 'bg-[#141726] border-white/[0.08] text-slate-300 hover:border-white/20'
              }`}
            >
              {curr === 'ALL' ? 'All Currencies' : curr}
            </button>
          ))}

          {(searchQuery || statusFilter !== 'ALL' || currencyFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCurrencyFilter('ALL');
              }}
              className="text-[11px] text-violet-400 hover:underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#10121d] rounded-2xl border border-white/[0.08]">
          Loading activity records from PostgreSQL &amp; Hyperledger Fabric...
        </div>
      ) : viewMode === 'GRID' ? (
        <TransactionTable
          payments={filteredPayments}
          onSelectPayment={(p) => setSelectedPayment(p)}
          title="Operational Activity Ledger"
          subtitle={`Displaying ${filteredPayments.length} transactions in AG Grid`}
        />
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#10121d] rounded-2xl border border-white/[0.08] space-y-2">
          <p className="text-slate-300 font-semibold">No transactions found</p>
          <p>No activity matches your active search and filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Group */}
          {groupedPayments.today.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today
              </div>
              <div className="space-y-2.5">
                {groupedPayments.today.map(renderPaymentItem)}
              </div>
            </div>
          )}

          {/* This Week Group */}
          {groupedPayments.thisWeek.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Last 7 Days
              </div>
              <div className="space-y-2.5">
                {groupedPayments.thisWeek.map(renderPaymentItem)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {groupedPayments.earlier.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Earlier
              </div>
              <div className="space-y-2.5">
                {groupedPayments.earlier.map(renderPaymentItem)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Transaction Details Drawer */}
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
