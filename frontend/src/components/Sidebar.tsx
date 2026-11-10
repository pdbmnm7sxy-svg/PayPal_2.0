'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  History,
  Route,
  ShieldCheck,
  Cpu,
  Building2,
  Settings,
  X,
  Radio,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
  onOpenSettings,
}: SidebarProps) {
  const pathname = usePathname();

  const coreLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transfers/new', label: 'New Transfer', icon: Send },
    { href: '/activity', label: 'Activity & History', icon: History },
    { href: '/routing', label: 'Route Optimizer', icon: Route },
  ];

  const intelligenceLinks = [
    { href: '/compliance', label: 'Fraud & Compliance', icon: ShieldCheck },
    { href: '/ledger', label: 'Consortium Ledger', icon: Cpu },
    { href: '/institutions', label: 'Institutions & Rails', icon: Building2 },
  ];

  const renderNavLinks = (links: typeof coreLinks) => {
    return links.map((link) => {
      const Icon = link.icon;
      const isActive =
        link.href === '/'
          ? pathname === '/'
          : pathname === link.href || pathname.startsWith(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onCloseMobile}
          className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isActive
              ? 'bg-[#15172a] text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.12)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={`w-4 h-4 transition-colors ${
                isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
            <span>{link.label}</span>
          </div>
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          )}
        </Link>
      );
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0b12] text-slate-100 p-4 border-r border-white/[0.08]">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-3 group" onClick={onCloseMobile}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform">
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
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Transnational
            </span>
            <span className="text-[10px] text-violet-400 block -mt-0.5 tracking-wider font-semibold uppercase">
              Settlement Network
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
        {/* Core Operations */}
        <div>
          <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Operations
          </span>
          <nav className="space-y-1">{renderNavLinks(coreLinks)}</nav>
        </div>

        {/* Intelligence & Ledger */}
        <div>
          <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Intelligence & Audit
          </span>
          <nav className="space-y-1">{renderNavLinks(intelligenceLinks)}</nav>
        </div>

        {/* System Settings */}
        <div>
          <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Platform
          </span>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>System Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Consortium Status Card */}
      <div className="pt-3 border-t border-white/[0.08]">
        <div className="p-3 rounded-xl bg-[#10121d] border border-white/[0.06] text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Consortium Status
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              Synced
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            3 Bank Nodes Active (US, DE, SG)
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside aria-label="Sidebar navigation" className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
