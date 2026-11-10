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
} from 'lucide-react';
import { Payment } from '../../types';
import { api } from '../../lib/api';
import TransactionTable from '../../components/TransactionTable';
import TransferDrawer from '../../components/TransferDrawer';

export default function ActivityPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filters (Matches Screenshot 4)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SETTLED' | 'PENDING' | 'HELD'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'EUR' | 'SGD'>('ALL');
  const [dateRange, setDateRange] = useState<'90_DAYS' | '30_DAYS' | 'ALL'>('90_DAYS');
  const [viewMode, setViewMode] = useState<'FEED' | 'GRID'>('FEED');

  useEffect(() => {
    api.getPayments().then((res) => {
      setPayments(res);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load activity:', err);
      setLoading(false);
    });
  }, []);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.senderBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiverBank.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
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

      // Currency
      const matchesCurrency =
        currencyFilter === 'ALL' || p.currency === currencyFilter;

      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [payments, searchQuery, statusFilter, currencyFilter]);

  // Group filtered payments by time periods (Matches Screenshot 4: "Completed", "Last week", "2 weeks ago")
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

  const exportActivityCsv = () => {
    const headers = 'ID,Reference,SenderBank,ReceiverBank,Amount,Currency,TargetAmount,TargetCurrency,Status,CreatedAt\n';
    const rows = filteredPayments
      .map(
        (p) =>
          `"${p.id}","${p.reference}","${p.senderBank}","${p.receiverBank}",${p.amount},"${p.currency}",${p.targetAmount},"${p.targetCurrency}","${p.status}","${p.createdAt}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transnational-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Payment Activity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable settlement history across Global Settlement Bank, EuroTransact AG, and Pacific Rim Financial
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-full shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('FEED')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'FEED'
                ? 'bg-[#0070e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </button>
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'GRID'
                ? 'bg-[#0070e0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>AG Grid Table</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Export (Inspired directly by Screenshot 4) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, reference, BIC, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-[#0070e0] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={exportActivityCsv}
            title="Download CSV Statement"
            className="w-11 h-11 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shadow-2xs shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pill Row (Matches Screenshot 4: "Date: Last 90 days", "Type", "Status", "Currency") */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter by:
          </span>

          {/* Date Filter Pill */}
          <button
            onClick={() => setDateRange(dateRange === '90_DAYS' ? '30_DAYS' : dateRange === '30_DAYS' ? 'ALL' : '90_DAYS')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e6f2fc] text-[#004b91] border border-blue-200 flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap active:scale-95"
          >
            <span>Date: {dateRange === '90_DAYS' ? 'Last 90 days' : dateRange === '30_DAYS' ? 'Last 30 days' : 'All time'}</span>
          </button>

          {/* Status Filter Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
            {(['ALL', 'SETTLED', 'PENDING', 'HELD'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'SETTLED' ? 'Settled' : st === 'PENDING' ? 'In Progress' : 'Held'}
              </button>
            ))}
          </div>

          {/* Currency Filter Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
            {(['ALL', 'USD', 'EUR', 'SGD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currencyFilter === curr
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {curr === 'ALL' ? 'All Currencies' : curr}
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== 'ALL' || currencyFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCurrencyFilter('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'GRID' ? (
        <TransactionTable
          payments={filteredPayments}
          onSelectPayment={(p) => setSelectedPayment(p)}
          loading={loading}
          title="Consortium Activity Table"
          subtitle={`Showing ${filteredPayments.length} transactions filtered by criteria`}
        />
      ) : (
        /* Activity Feed View (Directly inspired by Screenshot 4) */
        <div className="space-y-6">
          {/* Section: Today / Recent */}
          {groupedPayments.today.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Completed Today
              </h3>
              <div className="space-y-2">
                {groupedPayments.today.map((payment) => (
                  <ActivityCard
                    key={payment.id}
                    payment={payment}
                    onClick={() => setSelectedPayment(payment)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: This Week */}
          {groupedPayments.thisWeek.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Last week
              </h3>
              <div className="space-y-2">
                {groupedPayments.thisWeek.map((payment) => (
                  <ActivityCard
                    key={payment.id}
                    payment={payment}
                    onClick={() => setSelectedPayment(payment)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Earlier */}
          {groupedPayments.earlier.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Earlier this month
              </h3>
              <div className="space-y-2">
                {groupedPayments.earlier.map((payment) => (
                  <ActivityCard
                    key={payment.id}
                    payment={payment}
                    onClick={() => setSelectedPayment(payment)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredPayments.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No payment records found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing or adjusting your search filters above</p>
            </div>
          )}
        </div>
      )}

      {/* Transfer Details Drawer Modal */}
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

// Subcomponent: Activity Card (Matches Screenshot 4)
function ActivityCard({ payment, onClick }: { payment: Payment; onClick: () => void }) {
  const isSettled = payment.status === 'SETTLED' || payment.status === 'RECONCILED';
  const isHeld = payment.status === 'RISK_HELD' || payment.status === 'SETTLEMENT_FAILED';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4 group"
    >
      <div className="flex items-center gap-3.5">
        {/* Circular Avatar (Matches Screenshot 4) */}
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 group-hover:bg-blue-50 group-hover:text-[#0070e0] transition-colors">
          {payment.receiverBank.substring(0, 2)}
        </div>

        <div>
          <div className="text-sm font-bold text-slate-900 group-hover:text-[#0070e0] transition-colors">
            {payment.receiverName}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>{new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <span className="font-mono text-[11px]">{payment.reference}</span>
            <span>•</span>
            <span>{payment.senderBank} → {payment.receiverBank}</span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-slate-900 font-sans">
          {payment.currency} {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isSettled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isHeld
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {payment.status}
          </span>
        </div>
      </div>
    </div>
  );
}
