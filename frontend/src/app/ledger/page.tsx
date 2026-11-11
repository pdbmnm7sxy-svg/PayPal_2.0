'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Search, RefreshCw, Key, Shield, Layers, Blocks, CheckCircle2 } from 'lucide-react';
import { FabricBlock } from '../../types';
import { api } from '../../lib/api';

export default function LedgerChroniclePage() {
  const [blocks, setBlocks] = useState<FabricBlock[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLedger = async () => {
    try {
      const [fetchedBlocks, fetchedNet] = await Promise.all([
        api.getLedgerBlocks(50),
        api.getLedgerNetwork(),
      ]);
      setBlocks(fetchedBlocks);
      setNetworkInfo(fetchedNet);
    } catch (e) {
      console.error('Failed to load chronicle blocks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const filteredBlocks = blocks.filter((b) => {
    const q = filterText.toLowerCase();
    return (
      b.blockHash.toLowerCase().includes(q) ||
      b.txId.toLowerCase().includes(q) ||
      b.action.toLowerCase().includes(q) ||
      (b.paymentReference && b.paymentReference.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Broadsheet Masthead */}
      <div className="border-b-2 border-white/20 pb-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              IMMUTABLE CONSORTIUM LEDGER // HYPERLEDGER FABRIC v2.4
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mt-1 font-editorial uppercase">
              The Fabric Chronicle
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Cryptographic block sequence certifying pseudonymous state changes and correspondent wire confirmations.
            </p>
          </div>

          <button
            onClick={loadLedger}
            className="p-2.5 rounded-xl bg-space-900 border border-white/[0.08] text-slate-400 hover:text-white"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Network Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Channel Name</span>
            <span className="text-white font-bold">{networkInfo?.channel || 'transnational-channel'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Smart Contract</span>
            <span className="text-violet-300 font-bold">{networkInfo?.chaincode || 'transnational-chaincode@1.0.0'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Endorsement Policy</span>
            <span className="text-emerald-400 font-bold">3 Peer Nodes (US, DE, SG)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Committed Blocks</span>
            <span className="text-white font-bold">{blocks.length} Blocks</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block hash, TxID, payment ref..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-space-900 border border-white/[0.08] text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-violet-500 font-mono"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredBlocks.length} entries
        </span>
      </div>

      {/* Chronological Block Certificates */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400 bg-space-900 rounded-3xl border border-white/10">
            Reading blocks from Hyperledger Fabric peer nodes...
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400 bg-space-900 rounded-3xl border border-white/10">
            No matching blocks found in ledger.
          </div>
        ) : (
          filteredBlocks.map((block) => (
            <div
              key={block.blockNumber}
              className="p-6 rounded-3xl bg-space-900 border border-white/10 shadow-card-dark space-y-4 hover:border-violet-500/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-violet-500/20 text-violet-300 font-mono text-xs font-bold border border-violet-500/30">
                    BLOCK #{block.blockNumber}
                  </span>
                  <span className="text-sm font-bold text-white font-sans">
                    {block.action}
                  </span>
                  {block.paymentReference && (
                    <span className="text-xs font-mono text-slate-400">
                      Ref: {block.paymentReference}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400">
                  {new Date(block.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-space-850 border border-white/[0.04] truncate">
                  <span className="text-[10px] text-slate-500 block uppercase">SHA-256 Block Hash</span>
                  <span className="text-white select-all font-semibold">{block.blockHash}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-space-850 border border-white/[0.04] truncate">
                  <span className="text-[10px] text-slate-500 block uppercase">Ledger Transaction ID</span>
                  <span className="text-slate-300 select-all">{block.txId}</span>
                </div>
              </div>

              {block.details && (
                <div className="p-3.5 rounded-2xl bg-space-850 border border-white/[0.04] text-[11px] font-mono text-slate-300">
                  {typeof block.details === 'string' ? block.details : JSON.stringify(block.details)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
