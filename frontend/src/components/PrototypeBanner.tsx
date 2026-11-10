'use client';

import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Prototype Demonstration Notice" className="bg-[#0f111a] border-b border-violet-900/30 text-slate-300 text-xs px-4 py-2 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-400 mr-1.5 uppercase tracking-wide text-[11px]">
            Prototype Demonstration Notice:
          </span>
          Interbank settlement rails (Fedwire, Target2, MEPS+), liquidity balances, FX spreads, and KYC/AML screening are simulated. PayPal Sandbox checkout demonstrates institutional client funding verification; it does not perform or prove underlying correspondent banking settlement.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white transition-colors ml-auto shrink-0 p-1 rounded-md hover:bg-white/5"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
