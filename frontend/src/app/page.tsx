'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  Plus,
  Building,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  Send,
  History,
  Network,
  ShieldCheck,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Payment, DashboardStats, BankNode } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import TransferDrawer from '../components/TransferDrawer';

export default function DashboardPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [banks, setBanks] = useState<BankNode[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedPayments, fetchedStats, fetchedBanks] = await Promise.all([
        api.getPayments(),
        api.getPaymentStats(),
        api.getBanks(),
      ]);
      setPayments(fetchedPayments);
      setStats(fetchedStats);
      setBanks(fetchedBanks);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-Time Socket.IO stream subscription
    const socket = getSocket();

    const handlePaymentCreated = (newPayment: Payment) => {
      setPayments((prev) => [newPayment, ...prev]);
      api.getPaymentStats().then(setStats).catch(() => {});
    };

    const handlePaymentUpdated = (updated: Payment) => {
      setPayments((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      if (selectedPayment && selectedPayment.id === updated.id) {
        setSelectedPayment(updated);
      }
      api.getPaymentStats().then(setStats).catch(() => {});
    };

    const handleBanksUpdated = (updatedBanks: BankNode[]) => {
      setBanks(updatedBanks);
    };

    socket.on('payment.created', handlePaymentCreated);
    socket.on('payment.updated', handlePaymentUpdated);
    socket.on('banks.updated', handleBanksUpdated);

    return () => {
      socket.off('payment.created', handlePaymentCreated);
      socket.off('payment.updated', handlePaymentUpdated);
      socket.off('banks.updated', handleBanksUpdated);
    };
  }, [selectedPayment]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalLiquidityUSD = banks.reduce((sum, b) => {
    // Rough USD conversion for summary card
    const bal = Number(b.liquidityBalance) || 0;
    if (b.currency === 'USD') return sum + bal;
    if (b.currency === 'EUR') return sum + bal * 1.08;
    if (b.currency === 'SGD') return sum + bal * 0.74;
    return sum + bal;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Payments Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global settlement orchestration across 3 financial institutions with LightGBM fraud evaluation, Google OR-Tools routing, and Hyperledger Fabric audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/transfers/new"
            className="px-5 py-2 rounded-full bg-[#0070e0] hover:bg-[#005cb8] text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Transfer</span>
          </Link>
        </div>
      </div>

      {/* Featured Financial Liquidity & Quick Links Section (Inspired by Screenshot 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Available Liquidity Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Consortium Liquidity Pool
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Reserves
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                ${(totalLiquidityUSD / 1000000).toFixed(2)}M <span className="text-sm font-semibold text-slate-500 font-normal">USD Equiv</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Total aggregate reserves across 3 member clearing banks
              </p>
            </div>

            {/* Micro Liquidity Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
              {banks.slice(0, 3).map((bank) => (
                <div key={bank.code} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">{bank.code}</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {bank.currency} {(Number(bank.liquidityBalance) / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3">
            <Link
              href="/transfers/new"
              className="w-full py-2.5 px-4 rounded-full bg-[#0070e0] hover:bg-[#005cb8] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Money & Initiate Wire</span>
            </Link>
          </div>
        </div>

        {/* Quick Links Card (Inspired by Screenshot 2 "Quick links") */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Operations & Workflows
            </h3>
            <span className="text-xs text-slate-400">Institutional Services</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/transfers/new"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#0070e0]/40 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0070e0] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Send Money</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Initiate interbank wire</span>
            </Link>

            <Link
              href="/activity"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#0070e0]/40 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <History className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Activity History</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Filter & export records</span>
            </Link>

            <Link
              href="/routing"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#0070e0]/40 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Network className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">OR-Tools Routing</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Min-cost MIP solver</span>
            </Link>

            <Link
              href="/compliance"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-[#0070e0]/40 hover:shadow-xs transition-all group flex flex-col items-center text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">AI Risk Screener</span>
              <span className="text-[10px] text-slate-400 mt-0.5">LightGBM & KYC rules</span>
            </Link>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Hyperledger Fabric Channel: <strong className="text-slate-800">transnational-channel</strong>
            </span>
            <Link href="/ledger" className="text-[#0070e0] font-semibold hover:underline flex items-center gap-1">
              <span>View Block Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Payment Volume"
          value={
            stats
              ? `$${(stats.totalVolumeUSD / 1000).toFixed(1)}k`
              : '$0'
          }
          subtitle={`${stats?.totalTransfers || 0} total wires`}
          icon={DollarSign}
          badge="USD Equiv"
          badgeColor="blue"
        />

        <StatCard
          title="Settled & Reconciled"
          value={
            stats
              ? `$${(stats.settledVolumeUSD / 1000).toFixed(1)}k`
              : '$0'
          }
          subtitle={`${stats?.settledTransfersCount || 0} finalized transfers`}
          icon={CheckCircle2}
          badge="Settled"
          badgeColor="emerald"
        />

        <StatCard
          title="Active In-Flight"
          value={stats?.activeTransfersCount ?? 0}
          subtitle="Funding & routing phase"
          icon={Layers}
          badge="Pipeline"
          badgeColor="sky"
        />

        <StatCard
          title="Risk & Fraud Holds"
          value={stats?.heldTransfersCount ?? 0}
          subtitle="High score or compliance flag"
          icon={AlertTriangle}
          badge="Review"
          badgeColor={stats?.heldTransfersCount ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Fabric Blocks"
          value={stats?.fabricBlockCount ?? 1}
          subtitle="Consortium Ledger State"
          icon={Cpu}
          badge="Verifiable"
          badgeColor="indigo"
        />
      </div>

      {/* Main Operations Table (AG Grid Community) */}
      <TransactionTable
        payments={payments}
        onSelectPayment={(p) => setSelectedPayment(p)}
        loading={loading}
        title="Live Institutional Operations Grid"
        subtitle="Full AG Grid Community table with multi-column sorting, filtering, and real-time state tracking"
      />

      {/* Financial Institutions & Correspondent Liquidity Cards */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0070e0]" />
              <span>Consortium Member Institutions & Clearing Accounts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time Nostro/Vostro liquidity balances and RTGS clearing hubs
            </p>
          </div>
          <Link
            href="/institutions"
            className="text-xs text-[#0070e0] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All Nodes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banks.slice(0, 3).map((bank) => (
            <div
              key={bank.code}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0070e0]">
                  {bank.code}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  {bank.country} • {bank.currency}
                </span>
              </div>
              <div className="text-xs text-slate-800 mt-1 font-semibold">{bank.name}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex justify-between items-baseline">
                <span className="text-[11px] text-slate-500">Available Reserves:</span>
                <span className="text-xs font-bold text-emerald-700 font-sans">
                  {bank.currency} {(Number(bank.liquidityBalance) / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Details Drawer Modal */}
      <TransferDrawer
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onUpdate={(updated) => {
          setSelectedPayment(updated);
          setPayments((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
          api.getPaymentStats().then(setStats).catch(() => {});
        }}
      />
    </div>
  );
}
