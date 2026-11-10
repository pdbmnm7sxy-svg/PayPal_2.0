'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  trend,
}: StatCardProps) {
  return (
    <div className="bg-[#10121d] border border-white/[0.08] hover:border-violet-500/30 rounded-2xl p-5 shadow-card-dark transition-all duration-200 group relative overflow-hidden">
      {/* Subtle top glow highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent group-hover:via-violet-500/40 transition-all" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            {value}
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-all shadow-[0_0_12px_rgba(139,92,246,0.15)]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs">
        {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}

        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
          >
            {badge}
          </span>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-[11px]">
            <span
              className={
                trend.isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
              }
            >
              {trend.value}
            </span>
            <span className="text-slate-400">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
}
