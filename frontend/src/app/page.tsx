'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  PlusCircle,
  Building,
  RefreshCw,
  ArrowUpRight,
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

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Institutional Payments Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interbank settlement orchestration across 3 financial institutions with LightGBM fraud evaluation, OR-Tools routing, and Hyperledger Fabric audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/transfers/new"
            className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-brand-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Initiate Transfer</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Volume"
          value={
            stats
              ? `$${(stats.totalVolumeUSD / 1000).toFixed(1)}k`
              : '$0'
          }
          subtitle={`${stats?.totalTransfers || 0} total transactions`}
          icon={DollarSign}
          badge="USD Equiv"
          badgeColor="sky"
        />

        <StatCard
          title="Settled & Reconciled"
          value={
            stats
              ? `$${(stats.settledVolumeUSD / 1000).toFixed(1)}k`
              : '$0'
          }
          subtitle={`${stats?.settledTransfersCount || 0} finalized wires`}
          icon={CheckCircle2}
          badge="Complete"
          badgeColor="emerald"
        />

        <StatCard
          title="Active Pipeline"
          value={stats?.activeTransfersCount ?? 0}
          subtitle="Funding & routing stages"
          icon={Layers}
          badge="In-Flight"
          badgeColor="indigo"
        />

        <StatCard
          title="Risk Holds"
          value={stats?.heldTransfersCount ?? 0}
          subtitle="Fraud or AML flagged"
          icon={AlertTriangle}
          badge="Review"
          badgeColor={stats?.heldTransfersCount ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Fabric Blocks"
          value={stats?.fabricBlockCount ?? 1}
          subtitle="crossbridge-channel"
          icon={Cpu}
          badge="Consortium"
          badgeColor="sky"
        />
      </div>

      {/* Main Operations Table (AG Grid) */}
      <TransactionTable
        payments={payments}
        onSelectPayment={(p) => setSelectedPayment(p)}
        loading={loading}
      />

      {/* Simulated Institutions & Liquidity Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-400" />
              <span>Simulated Financial Institutions & Correspondent Liquidity</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live balances and bilateral correspondent accounts across Bank A, Bank B, and Bank C
            </p>
          </div>
          <Link
            href="/routing"
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-mono"
          >
            <span>Explore Corridors</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {banks.slice(0, 3).map((bank) => (
            <div
              key={bank.code}
              className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/70"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">
                  {bank.code}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                  {bank.country} • {bank.currency}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">{bank.name}</div>
              <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex justify-between items-baseline font-mono">
                <span className="text-[10px] text-slate-400">Available Liquidity:</span>
                <span className="text-xs font-semibold text-emerald-400">
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
