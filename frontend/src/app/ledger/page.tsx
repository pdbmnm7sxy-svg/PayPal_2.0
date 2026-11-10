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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#0070e0]" />
            <span>Hyperledger Fabric Consortium Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Permissioned distributed ledger recording pseudonymous state transitions, route selections, and bilateral interbank settlement verifications.
          </p>
        </div>

        <button
          onClick={loadLedger}
          className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Refresh ledger blocks"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Network Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consortium Channel</span>
          <span className="text-slate-900 font-bold font-mono">{networkInfo?.channel || 'transnational-channel'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Go Chaincode</span>
          <span className="text-[#0070e0] font-bold font-mono">{networkInfo?.chaincode || 'transnational-chaincode@1.0.0'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endorsing Orgs</span>
          <span className="text-emerald-700 font-bold">3 Banks (Org1, Org2, Org3)</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Blocks</span>
          <span className="text-slate-900 font-bold font-mono">{blocks.length} Blocks</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block hash, TxID, payment ref..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[#0070e0] font-mono shadow-2xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredBlocks.length} audit entries
        </span>
      </div>

      {/* Blocks List */}
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <div
            key={block.blockHash}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all font-mono text-xs space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0070e0] border border-blue-200">
                  Block #{block.blockNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {block.action}
                </span>
                {block.paymentReference && (
                  <span className="text-xs font-bold text-slate-900 font-sans">
                    Ref: {block.paymentReference}
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[11px] font-sans">
                {new Date(block.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="truncate">
                <span className="text-slate-400">Block Hash: </span>
                <span className="text-slate-900 font-semibold">{block.blockHash}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Prev Hash: </span>
                <span className="text-slate-500">{block.prevBlockHash}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Fabric Tx ID: </span>
                <span className="text-slate-700">{block.txId}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-400">Signer MSP: </span>
                <span className="text-slate-700">{block.mspId}</span>
              </div>
            </div>

            {block.details && (
              <details className="text-[11px] text-slate-500 pt-1">
                <summary className="cursor-pointer text-[#0070e0] hover:underline font-semibold font-sans">
                  Inspect Block State Payload
                </summary>
                <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 text-[10px] overflow-x-auto leading-relaxed">
                  {JSON.stringify(block.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
