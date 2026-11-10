'use client';

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridReadyEvent } from 'ag-grid-community';
import {
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Payment, PaymentStatus } from '../types';

interface TransactionTableProps {
  payments: Payment[];
  onSelectPayment: (payment: Payment) => void;
  loading?: boolean;
}

export default function TransactionTable({
  payments,
  onSelectPayment,
  loading = false,
}: TransactionTableProps) {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const columnDefs: ColDef<Payment>[] = useMemo(
    () => [
      {
        field: 'reference',
        headerName: 'Reference',
        minWidth: 160,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-brand-400">
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Corridor',
        minWidth: 200,
        sortable: true,
        valueGetter: (params) =>
          `${params.data?.senderBank} (${params.data?.senderCountry}) -> ${params.data?.receiverBank} (${params.data?.receiverCountry})`,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          const { senderBank, senderCountry, receiverBank, receiverCountry } = params.data;
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-white">{senderBank}</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">{senderCountry}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-white">{receiverBank}</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">{receiverCountry}</span>
            </div>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Source Amount',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <div className="font-mono text-xs font-semibold text-white">
              {params.data.currency} {Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        field: 'targetAmount',
        headerName: 'Target Settlement',
        minWidth: 150,
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <div className="font-mono text-xs text-slate-300">
              {params.data.targetCurrency} {Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-sans">
                @ {params.data.exchangeRate}
              </span>
            </div>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 160,
        filter: 'agTextColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.value) return null;
          const status = params.value as PaymentStatus;
          const config = {
            DRAFT: { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: 'Draft' },
            RISK_CHECKED: { bg: 'bg-blue-950/60 text-blue-400 border-blue-500/40', label: 'Risk Cleared' },
            RISK_HELD: { bg: 'bg-rose-950/60 text-rose-400 border-rose-500/40', label: 'Risk Held' },
            FUNDING_ORDER_CREATED: { bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40', label: 'Funding Created' },
            FUNDED_PAYPAL: { bg: 'bg-sky-950/60 text-sky-300 border-sky-500/40', label: 'PayPal Funded' },
            FUNDED_SIMULATED: { bg: 'bg-amber-950/60 text-amber-300 border-amber-500/40', label: 'Demo Funded' },
            ROUTED: { bg: 'bg-purple-950/60 text-purple-300 border-purple-500/40', label: 'Route Selected' },
            SETTLEMENT_PENDING: { bg: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/40', label: 'Settlement Pending' },
            SETTLED: { bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40', label: 'Settled' },
            SETTLEMENT_FAILED: { bg: 'bg-red-950/60 text-red-400 border-red-500/40', label: 'Failed' },
            RECONCILED: { bg: 'bg-teal-950/60 text-teal-300 border-teal-500/40', label: 'Reconciled' },
          }[status] || { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: status };

          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono border font-medium ${config.bg}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        field: 'fraudScore',
        headerName: 'AI Fraud Score',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          const score = Number(params.value);
          const riskLevel = params.data.fraudRiskLevel;
          const isHigh = riskLevel === 'HIGH';
          const isMed = riskLevel === 'MEDIUM';

          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span
                className={`font-semibold ${
                  isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {(score * 100).toFixed(2)}%
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded border uppercase ${
                  isHigh
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : isMed
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {riskLevel}
              </span>
            </div>
          );
        },
      },
      {
        field: 'fabricBlockHash',
        headerName: 'Fabric Ledger',
        minWidth: 140,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.value) {
            return <span className="text-slate-400 text-xs font-mono">Uncommitted</span>;
          }
          return (
            <div className="font-mono text-xs text-sky-400 flex items-center gap-1">
              <span>{params.value.substring(0, 8)}...</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'Initiated',
        minWidth: 130,
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.value) return null;
          const date = new Date(params.value);
          return (
            <div className="text-xs text-slate-300 font-mono">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
              <span className="text-slate-400">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Action',
        width: 100,
        pinned: 'right',
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <button
              onClick={() => onSelectPayment(params.data!)}
              className="px-2.5 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded transition-colors flex items-center gap-1"
            >
              <span>Inspect</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          );
        },
      },
    ],
    [onSelectPayment],
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Header with Quick Filter Search & Live Counters */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Interbank Payment Operations</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {payments.length} Records
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            AG Grid Community table with live sorting, filtering, and real-time state tracking
          </p>
        </div>

        {/* Quick Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search payments, banks, IDs..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors font-mono"
          />
        </div>
      </div>

      {/* AG Grid React Container */}
      <div className="ag-theme-quartz-dark w-full h-[520px]">
        <AgGridReact
          rowData={payments}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          quickFilterText={quickFilterText}
          onGridReady={onGridReady}
          rowSelection="single"
          onRowClicked={(event) => {
            if (event.data) onSelectPayment(event.data);
          }}
          defaultColDef={{
            resizable: true,
          }}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center text-slate-400 font-mono text-xs">Loading operational payment ledger...</span>'
          }
          overlayNoRowsTemplate={
            '<span class="ag-overlay-no-rows-center text-slate-400 font-mono text-xs">No payment transactions match current filter.</span>'
          }
        />
      </div>
    </div>
  );
}
