'use client';

import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-800 mr-1.5 uppercase tracking-wide text-[11px]">
            Prototype Demonstration Notice:
          </span>
          Interbank settlement rails (Fedwire, Target2, MEPS+), liquidity balances, FX spreads, and KYC/AML screening are simulated.
          PayPal Sandbox checkout demonstrates institutional client funding verification; it does not perform or prove underlying correspondent banking settlement.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 transition-colors ml-auto shrink-0 p-1 rounded-md hover:bg-amber-100/60"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
