'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Command,
  Settings,
  Layers,
  Sparkles,
  CreditCard,
  Building,
} from 'lucide-react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

interface TelemetryHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

export default function TelemetryHeader({
  onOpenCommandPalette,
  onOpenSettings,
}: TelemetryHeaderProps) {
  const [wsConnected, setWsConnected] = useState(false);
  const [paypalConfigured, setPaypalConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (socket.connected) setWsConnected(true);
    socket.on('connect', () => setWsConnected(true));
    socket.on('disconnect', () => setWsConnected(false));

    api
      .getPayPalClientId()
      .then((cfg) => setPaypalConfigured(cfg.configured))
      .catch(() => setPaypalConfigured(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <header className="h-14 border-b border-white/[0.08] bg-space-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand & Node Identity */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-violet group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="3.6" y1="9" x2="20.4" y2="9" />
              <line x1="3.6" y1="15" x2="20.4" y2="15" />
              <path d="M11.5 3a17 17 0 0 0 0 18" />
              <path d="M12.5 3a17 17 0 0 1 0 18" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
              TRANSNATIONAL
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                ORBITAL v2.0
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              GSB_US • CLEARING NODE 01
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Command Palette Trigger Button */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="px-3.5 py-1.5 rounded-xl bg-space-900 border border-white/[0.08] hover:border-violet-500/50 hover:bg-space-850 text-slate-300 text-xs flex items-center gap-2 transition-all shadow-sm group"
        >
          <Command className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
          <span className="text-slate-400 group-hover:text-slate-200">
            Search corridors, execute wires, inspect ledger...
          </span>
          <kbd className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/10 font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Live Telemetry Status & System Config */}
      <div className="flex items-center gap-2.5">
        {/* WebSocket Stream Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-900 border border-white/[0.08] text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 hidden sm:inline">
            {wsConnected ? 'STREAM LIVE' : 'CONNECTING'}
          </span>
        </div>

        {/* PayPal Sandbox Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-900 border border-white/[0.08] text-[11px]">
          {paypalConfigured === true ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium hidden sm:inline">Sandbox Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-medium hidden sm:inline">Demo Funding</span>
            </>
          )}
        </div>

        {/* Settings / Diagnostics Trigger */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-space-900 border border-white/[0.08] hover:bg-space-850 text-slate-400 hover:text-white transition-colors"
          title="System Diagnostics & Credentials"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
