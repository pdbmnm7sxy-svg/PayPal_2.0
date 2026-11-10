'use client';

import React, { useState } from 'react';
import {
  Network,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  Coins,
  Radio,
} from 'lucide-react';
import { BankNode } from '../types';

interface NetworkCorridorMapProps {
  banks: BankNode[];
}

export default function NetworkCorridorMap({ banks }: NetworkCorridorMapProps) {
  const [selectedNode, setSelectedNode] = useState<string>('GSB_US');

  const nodes = [
    {
      code: 'GSB_US',
      name: 'Global Settlement Bank',
      city: 'New York',
      country: 'United States',
      currency: 'USD',
      rail: 'Fedwire RTGS',
      reserve: '$25,000,000',
      x: 20,
      y: 40,
      color: '#8b5cf6', // Violet
      peers: ['EUROT_DE', 'PACIFIC_SG'],
    },
    {
      code: 'EUROT_DE',
      name: 'EuroTransact AG',
      city: 'Frankfurt',
      country: 'Germany',
      currency: 'EUR',
      rail: 'Target2 Clearing',
      reserve: '€18,500,000',
      x: 52,
      y: 30,
      color: '#3b82f6', // Blue
      peers: ['GSB_US', 'PACIFIC_SG'],
    },
    {
      code: 'PACIFIC_SG',
      name: 'Pacific Rim Financial',
      city: 'Singapore',
      country: 'Singapore',
      currency: 'SGD',
      rail: 'MEPS+ Bilateral',
      reserve: 'S$34,000,000',
      x: 82,
      y: 65,
      color: '#10b981', // Emerald
      peers: ['GSB_US', 'EUROT_DE'],
    },
  ];

  const corridors = [
    {
      from: 'GSB_US',
      to: 'EUROT_DE',
      name: 'Transatlantic Corridor',
      time: '35 min',
      spread: '12 bps',
      volume: '$630,000 in-flight',
      status: 'Optimal',
    },
    {
      from: 'EUROT_DE',
      to: 'PACIFIC_SG',
      name: 'Eurasia Corridor',
      time: '50 min',
      spread: '15 bps',
      volume: '$350,000 in-flight',
      status: 'Optimal',
    },
    {
      from: 'PACIFIC_SG',
      to: 'GSB_US',
      name: 'Transpacific Corridor',
      time: '45 min',
      spread: '14 bps',
      volume: '$292,000 in-flight',
      status: 'Optimal',
    },
  ];

  const activeNode = nodes.find((n) => n.code === selectedNode) || nodes[0];

  return (
    <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl p-6 shadow-card-dark relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Network className="w-4 h-4 text-violet-400" />
              <span>Simulated Interbank Corridors & Liquidity Mesh</span>
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 uppercase tracking-wider">
              Prototype Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time OR-Tools route candidate map across 3 consortium clearing banks with simulated bilateral liquidity pools.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            3/3 Corridors Open
          </span>
        </div>
      </div>

      {/* Interactive Visual Map Canvas */}
      <div className="relative mt-6 min-h-[220px] bg-[#0c0e17] rounded-xl border border-white/[0.06] p-4 flex flex-col justify-between overflow-hidden">
        {/* SVG connection lines between nodes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="corridor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Line: US to DE */}
          <line
            x1="22%"
            y1="45%"
            x2="52%"
            y2="35%"
            stroke="url(#corridor-gradient)"
            strokeWidth="2"
            strokeDasharray="4 3"
            filter="url(#glow)"
          />
          {/* Line: DE to SG */}
          <line
            x1="52%"
            y1="35%"
            x2="80%"
            y2="65%"
            stroke="url(#corridor-gradient)"
            strokeWidth="2"
            strokeDasharray="4 3"
            filter="url(#glow)"
          />
          {/* Line: SG to US */}
          <line
            x1="80%"
            y1="65%"
            x2="22%"
            y2="45%"
            stroke="url(#corridor-gradient)"
            strokeWidth="2"
            strokeDasharray="4 3"
            filter="url(#glow)"
          />
        </svg>

        {/* 3 Node Cards positioned interactively */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.code;
            return (
              <div
                key={node.code}
                onClick={() => setSelectedNode(node.code)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#15182a] border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                    : 'bg-[#10121e]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#121524]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: node.color, color: node.color }}
                    />
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {node.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                    {node.currency}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {node.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{node.city}, {node.country}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reserve Pool</span>
                    <span className="font-semibold text-white text-xs">{node.reserve}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Clearing Rail</span>
                    <span className="text-[11px] font-mono text-violet-300">{node.rail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Detailed Corridor Strip */}
        <div className="relative z-10 mt-4 p-3 rounded-xl bg-[#090b12] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-violet-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">Active Corridor Focus: </span>
              <span className="font-mono text-violet-300">{activeNode.code} ({activeNode.city})</span>
              <span className="text-slate-400 ml-2">→ Connected with {activeNode.peers.join(' & ')} via Google OR-Tools routing</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Avg Transit: ~40m
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              Slippage: &lt;14 bps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
