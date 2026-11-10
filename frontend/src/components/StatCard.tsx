'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'sky',
}: StatCardProps) {
  const badgeClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  }[badgeColor];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeClasses}`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}
