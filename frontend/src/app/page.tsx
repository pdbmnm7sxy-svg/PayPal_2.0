'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Building,
  RefreshCw,
  Send,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Payment, DashboardStats, BankNode } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import OrbitalUniverseView from '../components/OrbitalUniverseView';
import TransactionTable from '../components/TransactionTable';
import TransferDrawer from '../components/TransferDrawer';

export default function DashboardUniversePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [banks, setBanks] = useState<BankNode[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(true);

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
      console.error('Failed to load universe data:', e);
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-space-900 border border-white/[0.08] shadow-card-dark relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Total Volume
            </span>
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
            ${((stats?.totalVolumeUSD || 0) / 1000000).toFixed(2)}M
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>+12.4%</span>
            <span className="text-slate-400">wholesale 24h</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-space-900 border border-white/[0.08] shadow-card-dark relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              In-Flight Wires
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
            {stats?.activeTransfersCount ?? 4} Active
          </div>
          <div className="mt-1 text-[11px] text-amber-400 font-mono">
            Routing &amp; Settling
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-space-900 border border-white/[0.08] shadow-card-dark relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Compliance Holds
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
            {stats?.heldTransfersCount ?? 2} Held
          </div>
          <div className="mt-1 text-[11px] text-rose-400 font-mono">
            Model / Sanctions Alert
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-space-900 border border-white/[0.08] shadow-card-dark relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Liquidity Mesh
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-white font-mono">
            ${(totalLiquidityUSD / 1000000).toFixed(1)}M
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            3 Hubs Synchronized
          </div>
        </div>
      </div>

      {/* Cinematic Settlement Universe Viewport */}
      <OrbitalUniverseView
        banks={banks}
        payments={payments}
        onSelectPayment={(p) => setSelectedPayment(p)}
      />

      {/* Sliding AG Grid Operations & Telemetry Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Telemetry Record Deck
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              AG Grid Community • {payments.length} Transactions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-xl bg-space-900 border border-white/[0.08] text-slate-400 hover:text-white"
              title="Refresh ledger state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              <span>{telemetryOpen ? 'Collapse Deck' : 'Expand Deck'}</span>
              {telemetryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {telemetryOpen && (
          <TransactionTable
            payments={payments}
            onSelectPayment={(p) => setSelectedPayment(p)}
            loading={loading}
            title="Consortium Payment Telemetry Deck"
            subtitle="Real-time multi-currency settlement stream synchronized across PostgreSQL, LightGBM, and Hyperledger Fabric"
          />
        )}
      </div>

      {/* Spatial Transaction Inspector Drawer */}
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
