'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Send,
  History,
  Building2,
  ShieldCheck,
  Cpu,
  Plus,
  Radio,
  CheckCircle2,
  AlertCircle,
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
    { href: '/', label: 'Dashboard', icon: Layers },
    { href: '/transfers/new', label: 'Transfers', icon: Send },
    { href: '/activity', label: 'Activity', icon: History },
    { href: '/institutions', label: 'Institutions', icon: Building2 },
    { href: '/compliance', label: 'Fraud & Compliance', icon: ShieldCheck },
    { href: '/ledger', label: 'Consortium Ledger', icon: Cpu },
  ];

  return (
    <header className="bg-[#0c2340] text-white shadow-md sticky top-0 z-40 border-b border-[#13345e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Transnational Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
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
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Transnational
                </span>
                <span className="text-[10px] text-slate-300 block -mt-0.5 tracking-wider font-medium uppercase">
                  Institutional Settlement Network
                </span>
              </div>
            </Link>

            {/* Navigation Pill Links (Matches Screenshots 3 & 4) */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#153e75] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Status Controls & Primary Action */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono">{wsConnected ? 'Live' : 'Polling'}</span>
            </div>

            {/* PayPal Sandbox Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
              {paypalConfigured === true ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">Sandbox Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-200">Demo Funding</span>
                </>
              )}
            </div>

            {/* Prominent Send Money Action */}
            <Link
              href="/transfers/new"
              className="bg-[#0070e0] hover:bg-[#005cb8] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Send Money</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-white/10 scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#153e75] text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
