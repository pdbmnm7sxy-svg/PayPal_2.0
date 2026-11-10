'use client';

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, GridReadyEvent } from 'ag-grid-community';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Download,
  Filter,
  Shield,
  Layers,
} from 'lucide-react';
import { Payment, PaymentStatus } from '../types';

interface TransactionTableProps {
  payments: Payment[];
  onSelectPayment: (payment: Payment) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export default function TransactionTable({
  payments,
  onSelectPayment,
  loading = false,
  title = 'Recent Operations & Transfers',
  subtitle = 'High-frequency institutional settlement tracking with AG Grid Community',
}: TransactionTableProps) {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [gridApi, setGridApi] = useState<any>(null);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const exportCsv = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `transnational-transactions-${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
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
          if (!params.value) return null;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-violet-400 hover:text-violet-300">
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Corridor',
        minWidth: 220,
        sortable: true,
        valueGetter: (params) =>
          `${params.data?.senderBank} (${params.data?.senderCountry}) -> ${params.data?.receiverBank} (${params.data?.receiverCountry})`,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          const { senderBank, senderCountry, receiverBank, receiverCountry } = params.data;
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-200">{senderBank}</span>
              <span className="text-[10px] text-slate-400 bg-white/[0.06] px-1 py-0.5 rounded border border-white/[0.08]">
                {senderCountry}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-200">{receiverBank}</span>
              <span className="text-[10px] text-slate-400 bg-white/[0.06] px-1 py-0.5 rounded border border-white/[0.08]">
                {receiverCountry}
              </span>
            </div>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Source Amount',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <div className="text-xs font-bold text-white font-sans">
              {params.data.currency} {Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        field: 'targetAmount',
        headerName: 'Target Settlement',
        minWidth: 160,
        sortable: true,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          return (
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">
                {params.data.targetCurrency} {Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block -mt-0.5">
                Rate: {params.data.exchangeRate}
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
            DRAFT: { bg: 'bg-slate-800/60 text-slate-300 border-slate-700', label: 'Draft' },
            RISK_CHECKED: { bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Risk Cleared' },
            RISK_HELD: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Risk Held' },
            FUNDING_ORDER_CREATED: { bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', label: 'Order Created' },
            FUNDED_PAYPAL: { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30', label: 'PayPal Funded' },
            FUNDED_SIMULATED: { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Demo Funded' },
            ROUTED: { bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30', label: 'Route Selected' },
            SETTLEMENT_PENDING: { bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', label: 'Settling' },
            SETTLED: { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold', label: 'Settled' },
            SETTLEMENT_FAILED: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', label: 'Failed' },
            RECONCILED: { bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30', label: 'Reconciled' },
          }[status] || { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: status };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium ${config.bg}`}
            >
              {config.label}
            </span>
          );
        },
      },
      {
        field: 'fraudScore',
        headerName: 'AI Risk Score',
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
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`font-semibold ${
                  isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {(score * 100).toFixed(2)}%
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-medium ${
                  isHigh
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    : isMed
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
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
        headerName: 'Ledger Audit',
        minWidth: 140,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.value) {
            return <span className="text-slate-500 text-xs font-mono">Uncommitted</span>;
          }
          return (
            <div className="font-mono text-xs text-slate-300 flex items-center gap-1">
              <span>{params.value.substring(0, 8)}...</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
            <div className="text-xs text-slate-400">
              <span className="font-medium text-slate-200">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>{' '}
              <span className="text-slate-500 text-[11px]">
                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
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
              className="px-3 py-1 text-xs font-medium text-violet-300 hover:text-white bg-violet-600/15 hover:bg-violet-600 border border-violet-500/30 hover:border-transparent rounded-lg transition-all flex items-center gap-1 shadow-sm"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          );
        },
      },
    ],
    [onSelectPayment],
  );

  return (
    <div className="bg-[#10121d] border border-white/[0.08] rounded-2xl overflow-hidden shadow-card-dark">
      {/* Table Header with Quick Filter Search & Live Counters */}
      <div className="p-5 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              {payments.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Quick Filter Search & Export Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, bank, country..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="w-full bg-[#141726] border border-white/[0.08] text-xs text-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-violet-500/50 focus:bg-[#181c2f] transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={exportCsv}
            title="Export CSV"
            className="p-2 text-slate-300 hover:text-white bg-[#141726] hover:bg-[#1a1e32] border border-white/[0.08] rounded-xl transition-all text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* AG Grid React Dark Container */}
      <div className="ag-theme-quartz ag-dark-custom w-full h-[520px]">
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
            '<span class="ag-overlay-loading-center text-slate-400 font-sans text-xs">Loading operational payment ledger...</span>'
          }
          overlayNoRowsTemplate={
            '<span class="ag-overlay-no-rows-center text-slate-400 font-sans text-xs">No payment transactions match current filter.</span>'
          }
        />
      </div>
    </div>
  );
}
