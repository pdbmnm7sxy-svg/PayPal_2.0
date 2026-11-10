'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';

export default function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-6xl">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold text-amber-300 mr-1.5 uppercase tracking-wide">
            Hackathon Prototype Notice:
          </span>
          Interbank settlement rails (Fedwire, Target2, MEPS+), liquidity pools, FX conversion, and KYC/AML screening are simulated.
          PayPal Sandbox checkout demonstrates institutional pre-funding verification; it does not constitute or execute underlying correspondent banking settlement.
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-200 transition-colors ml-4 shrink-0 p-1"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
