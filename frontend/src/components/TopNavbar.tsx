'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  Radio,
  Building,
  User,
} from 'lucide-react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
  onOpenSettings: () => void;
}

export default function TopNavbar({
  onToggleMobileMenu,
  onOpenSettings,
}: TopNavbarProps) {
  const [wsConnected, setWsConnected] = useState(false);
  const [paypalConfigured, setPaypalConfigured] = useState<boolean | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (socket.connected) setWsConnected(true);
    socket.on('connect', () => setWsConnected(true));
    socket.on('disconnect', () => setWsConnected(false));

    api
      .getPayPalConfig()
      .then((cfg) => setPaypalConfigured(cfg.configured))
      .catch(() => setPaypalConfigured(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <header className="h-14 bg-[#0a0b12] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfers, institutions, routes..."
            className="w-full bg-[#10121d] border border-white/[0.06] text-xs text-slate-200 rounded-xl pl-9 pr-8 py-1.5 focus:outline-none focus:border-violet-500/50 focus:bg-[#141726] transition-all placeholder:text-slate-500"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white/[0.06] text-slate-400 px-1.5 py-0.5 rounded border border-white/[0.08] font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Status Badges, Notifications, Primary Action & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* WebSocket Live Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10121d] border border-white/[0.06] text-[11px] text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-mono text-slate-400">
            {wsConnected ? 'Live' : 'Polling'}
          </span>
        </div>

        {/* PayPal Sandbox Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10121d] border border-white/[0.06] text-[11px]">
          {paypalConfigured === true ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Sandbox Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300/90 font-medium">Demo Mode</span>
            </>
          )}
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#0a0b12]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121422] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="font-bold text-white text-xs">Simulated Notifications</span>
                <span className="text-[10px] text-violet-400 font-semibold uppercase">2 New</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="font-semibold text-slate-200">Fabric Block #44 Committed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">SHA-256 state transition confirmed across 3 peer nodes.</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="font-semibold text-amber-300">Sanctions Watchlist Check</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Wire to Vasily Malyshev automatically held by simulated OFAC AML rule.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button: New Transfer */}
        <Link
          href="/transfers/new"
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Transfer</span>
        </Link>

        {/* User / Treasury Node Profile Pill */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#10121d] border border-white/[0.06] hover:border-violet-500/30 cursor-pointer transition-all"
          title="Account Profile & Settings"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            TN
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-[11px] font-semibold text-slate-200 block leading-tight">
              GSB_US Node
            </span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              Treasury Operator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
