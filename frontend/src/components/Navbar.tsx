'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Radio,
  Layers,
  ShieldCheck,
  Network,
  CreditCard,
  PlusCircle,
  Cpu,
} from 'lucide-react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

export default function Navbar() {
  const pathname = usePathname();
  const [wsConnected, setWsConnected] = useState(false);
  const [paypalConfigured, setPaypalConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Check WebSocket connectivity
    const socket = getSocket();
    if (socket.connected) {
      setWsConnected(true);
    }
    socket.on('connect', () => setWsConnected(true));
    socket.on('disconnect', () => setWsConnected(false));

    // Check PayPal sandbox config
    api.getPayPalConfig().then((cfg) => {
      setPaypalConfigured(cfg.configured);
    }).catch(() => {
      setPaypalConfigured(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Operations Dashboard', icon: Layers },
    { href: '/transfers/new', label: 'New Transfer', icon: PlusCircle },
    { href: '/compliance', label: 'Fraud & Compliance', icon: ShieldCheck },
    { href: '/routing', label: 'OR-Tools Routing', icon: Network },
    { href: '/ledger', label: 'Fabric Ledger', icon: Cpu },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Crossbridge <span className="text-brand-400">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono uppercase tracking-wider">
                  Interbank Settlement Orchestrator
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center gap-2.5">
            {/* Live Socket Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                wsConnected
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
              }`}
              title={wsConnected ? 'Real-Time WebSocket Stream Connected' : 'Reconnecting to live event stream...'}
            >
              <Radio className={`w-3 h-3 ${wsConnected ? 'animate-pulse' : ''}`} />
              <span>{wsConnected ? 'LIVE' : 'DISCONNECTED'}</span>
            </div>

            {/* PayPal Sandbox Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                paypalConfigured
                  ? 'bg-sky-950/40 border-sky-500/30 text-sky-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title={
                paypalConfigured
                  ? 'PayPal Sandbox API Configured'
                  : 'PayPal Sandbox unconfigured - Demo simulation active'
              }
            >
              <CreditCard className="w-3 h-3" />
              <span>{paypalConfigured ? 'SANDBOX ACTIVE' : 'SANDBOX UNCONFIGURED'}</span>
            </div>

            {/* Team Metadata pill */}
            <div className="hidden lg:block text-right border-l border-slate-800 pl-3">
              <div className="text-[10px] text-slate-400 font-mono">Team ERROR (PS-01)</div>
              <div className="text-[9px] text-slate-400 font-mono">Open Innovation</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
