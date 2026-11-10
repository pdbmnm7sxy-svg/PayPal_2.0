'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Search, RefreshCw, Key, Shield, Layers, Blocks } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-violet-400" />
            <span>Hyperledger Fabric Consortium Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permissioned distributed ledger recording pseudonymous state transitions, route selections, and bilateral interbank settlement verifications.
          </p>
        </div>

        <button
          onClick={loadLedger}
          className="p-2 rounded-xl border border-white/[0.08] bg-[#10121d] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Refresh ledger blocks"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Network Status Card */}
      <div className="p-5 rounded-2xl bg-[#10121d] border border-white/[0.08] shadow-card-dark grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consortium Channel</span>
          <span className="text-white font-bold font-mono">{networkInfo?.channel || 'transnational-channel'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Go Chaincode</span>
          <span className="text-violet-400 font-bold font-mono">{networkInfo?.chaincode || 'transnational-chaincode@1.0.0'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endorsing Orgs</span>
          <span className="text-emerald-400 font-bold">3 Banks (Org1, Org2, Org3)</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Blocks</span>
          <span className="text-white font-bold font-mono">{blocks.length} Blocks</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block hash, TxID, payment ref..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-[#10121d] border border-white/[0.08] text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-violet-500 font-mono placeholder:text-slate-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredBlocks.length} audit entries
        </span>
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#10121d] rounded-2xl border border-white/[0.08]">
            Loading blocks from Hyperledger Fabric peer nodes...
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#10121d] rounded-2xl border border-white/[0.08]">
            No blocks matched your search criteria.
          </div>
        ) : (
          filteredBlocks.map((block) => (
            <div
              key={block.blockNumber}
              className="p-5 rounded-2xl bg-[#10121d] border border-white/[0.08] hover:border-violet-500/30 transition-all shadow-card-dark space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-lg">
                    Block #{block.blockNumber}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {block.action}
                  </span>
                  {block.paymentReference && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Ref: {block.paymentReference}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(block.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#141726] border border-white/[0.04] truncate">
                  <span className="text-slate-400 block text-[10px]">Block SHA-256 Hash:</span>
                  <span className="text-white select-all font-semibold">{block.blockHash}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141726] border border-white/[0.04] truncate">
                  <span className="text-slate-400 block text-[10px]">Transaction ID:</span>
                  <span className="text-slate-300 select-all">{block.txId}</span>
                </div>
              </div>

              {block.details && (
                <div className="text-[11px] text-slate-400 bg-[#0e101a] p-2.5 rounded-xl border border-white/[0.04]">
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
