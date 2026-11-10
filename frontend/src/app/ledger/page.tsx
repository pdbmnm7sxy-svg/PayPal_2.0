'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Search, RefreshCw, Key, Shield, Layers } from 'lucide-react';
import { FabricBlock } from '../../types';
import { api } from '../../lib/api';

export default function LedgerPage() {
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
      console.error('Failed to load ledger:', e);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-sky-400" />
            <span>Hyperledger Fabric Consortium Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permissioned distributed ledger recording pseudonymous state transitions, route selections, and bilateral interbank settlement verifications.
          </p>
        </div>

        <button
          onClick={loadLedger}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Network Status Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Consortium Channel</span>
          <span className="text-white font-bold">{networkInfo?.channel || 'crossbridge-channel'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Go Chaincode</span>
          <span className="text-sky-400 font-bold">{networkInfo?.chaincode || 'crossbridge-chaincode@1.0.0'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Endorsing Orgs</span>
          <span className="text-emerald-400 font-bold">3 Banks (Org1, Org2, Org3)</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Total Blocks</span>
          <span className="text-white font-bold">{blocks.length} Blocks</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block hash, TxID, payment ref..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredBlocks.length} audit entries
        </span>
      </div>

      {/* Block Stream */}
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <div
            key={block.blockHash + block.blockNumber}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs space-y-2 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 text-[11px] font-bold">
                  Block #{block.blockNumber}
                </span>
                <span className="text-white font-semibold">{block.action}</span>
                {block.paymentReference && (
                  <span className="text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                    {block.paymentReference}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>{block.mspId}</span>
                <span>•</span>
                <span>{new Date(block.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="truncate">
                <span className="text-slate-400">Block Hash: </span>
                <span className="text-sky-300">{block.blockHash}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Prev Hash: </span>
                <span className="text-slate-400">{block.prevBlockHash}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Tx ID: </span>
                <span className="text-slate-300">{block.txId}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Payload Hash: </span>
                <span className="text-slate-300">{block.payloadHash}</span>
              </div>
            </div>

            {block.details && (
              <div className="pt-2 text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60 overflow-x-auto">
                <pre>{JSON.stringify(block.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
