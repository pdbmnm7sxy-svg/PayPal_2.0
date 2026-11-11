'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Send,
  BookOpen,
  Route,
  ShieldCheck,
  Cpu,
  Building2,
  Plus,
  Sparkles,
} from 'lucide-react';

interface TactileDockProps {
  onOpenCommandPalette: () => void;
}

export default function TactileDock({ onOpenCommandPalette }: TactileDockProps) {
  const pathname = usePathname();

  const dockItems = [
    { href: '/', label: 'Universe', icon: Globe, description: 'Orbital Topology' },
    { href: '/transfers/new', label: 'Wire Studio', icon: Send, description: 'Multi-Pane Studio' },
    { href: '/activity', label: 'Gazette', icon: BookOpen, description: 'Ledger Chronicle' },
    { href: '/routing', label: 'Solver', icon: Route, description: 'OR-Tools Matrix' },
    { href: '/compliance', label: 'AI Lab', icon: ShieldCheck, description: 'LightGBM Model' },
    { href: '/ledger', label: 'Blocks', icon: Cpu, description: 'Fabric Audit' },
    { href: '/institutions', label: 'Mesh', icon: Building2, description: 'Reserves & RTGS' },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
      {/* Floating Segmented Tactile Dock */}
      <div className="glass-dock rounded-2xl sm:rounded-full p-1.5 flex items-center gap-1 shadow-dock">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 select-none ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-violet scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* Quick Launch Wire CTA */}
        <Link
          href="/transfers/new"
          className="px-3.5 py-2 rounded-xl sm:rounded-full bg-cosmic-cyan/20 border border-cosmic-cyan/40 hover:bg-cosmic-cyan/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-cyan active:scale-95"
          title="Initiate New Wire Vector"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Launch Wire</span>
        </Link>
      </div>
    </div>
  );
}
