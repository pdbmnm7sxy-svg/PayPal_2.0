'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Globe,
  Send,
  BookOpen,
  Route,
  ShieldCheck,
  Cpu,
  Building2,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenSettings,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'universe',
      label: 'Open Settlement Universe (Mission Control)',
      category: 'Navigation',
      icon: Globe,
      action: () => {
        router.push('/');
        onClose();
      },
    },
    {
      id: 'studio',
      label: 'Launch Wire Studio (New Transfer)',
      category: 'Actions',
      icon: Send,
      action: () => {
        router.push('/transfers/new');
        onClose();
      },
    },
    {
      id: 'gazette',
      label: 'Inspect Settlement Gazette (Activity Ledger)',
      category: 'Navigation',
      icon: BookOpen,
      action: () => {
        router.push('/activity');
        onClose();
      },
    },
    {
      id: 'routing',
      label: 'OR-Tools Corridor Optimizer',
      category: 'Optimization',
      icon: Route,
      action: () => {
        router.push('/routing');
        onClose();
      },
    },
    {
      id: 'compliance',
      label: 'Hugging Face AI Fraud & AML Lab',
      category: 'Intelligence',
      icon: ShieldCheck,
      action: () => {
        router.push('/compliance');
        onClose();
      },
    },
    {
      id: 'ledger',
      label: 'Hyperledger Fabric Block Explorer',
      category: 'Audit',
      icon: Cpu,
      action: () => {
        router.push('/ledger');
        onClose();
      },
    },
    {
      id: 'institutions',
      label: 'Interbank Reserve Mesh & RTGS',
      category: 'Network',
      icon: Building2,
      action: () => {
        router.push('/institutions');
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'System & PayPal Sandbox Configuration',
      category: 'System',
      icon: Zap,
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-space-850 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="relative p-4 border-b border-white/[0.08] flex items-center gap-3">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search commands, corridors, ledger tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500 font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-600/15 hover:border-violet-500/30 border border-transparent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-violet-500/20 text-slate-300 group-hover:text-violet-300 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-space-900 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with click or arrow keys</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
