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
  Send,
  History,
  Network,
  ShieldCheck,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Payment, DashboardStats, BankNode } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import TransferDrawer from '../components/TransferDrawer';
import NetworkCorridorMap from '../components/NetworkCorridorMap';

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
    const bal = Number(b.liquidityBalance) || 0;
    if (b.currency === 'USD') return sum + bal;
    if (b.currency === 'EUR') return sum + bal * 1.08;
    if (b.currency === 'SGD') return sum + bal * 0.74;
    return sum + bal;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Institutional Payments Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global settlement orchestration across 3 financial institutions with LightGBM fraud evaluation, Google OR-Tools routing, and Hyperledger Fabric audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#10121d] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/transfers/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Transfer</span>
          </Link>
        </div>
      </div>

      {/* 4 Concise Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Payment Volume"
          value={`$${((stats?.totalVolumeUSD || 0) / 1000000).toFixed(2)}M`}
          subtitle="Processed wholesale volume"
          icon={DollarSign}
          trend={{ value: '+12.4%', isPositive: true }}
        />

        <StatCard
          title="Payments In Flight"
          value={stats?.activeTransfersCount ?? 4}
          subtitle="Pending settlement / routing"
          icon={Clock}
          badge="In Progress"
          badgeColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
        />

        <StatCard
          title="Fraud & Compliance Holds"
          value={stats?.heldTransfersCount ?? 2}
          subtitle="Model or sanctions flagged"
          icon={AlertTriangle}
          badge="Action Req"
          badgeColor="bg-rose-500/15 text-rose-300 border-rose-500/30"
        />

        <StatCard
          title="Available Liquidity"
          value={`$${(totalLiquidityUSD / 1000000).toFixed(1)}M`}
          subtitle="Reserves across 3 member banks"
          icon={Building}
          badge="Reserves Active"
          badgeColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        />
      </div>

      {/* Original Interactive Network Corridor Visualization */}
      <NetworkCorridorMap banks={banks} />

      {/* Recent Transactions in Dark-Themed AG Grid */}
      <TransactionTable
        payments={payments}
        onSelectPayment={(p) => setSelectedPayment(p)}
        loading={loading}
        title="Recent Operations & Settlement Records"
        subtitle="Live consortium payment state stream synchronized with PostgreSQL and Hyperledger Fabric"
      />

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
