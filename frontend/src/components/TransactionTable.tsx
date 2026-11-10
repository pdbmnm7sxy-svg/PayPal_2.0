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
          if (!params.data) return null;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0070e0]">
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Corridor',
        minWidth: 210,
        sortable: true,
        valueGetter: (params) =>
          `${params.data?.senderBank} (${params.data?.senderCountry}) -> ${params.data?.receiverBank} (${params.data?.receiverCountry})`,
        cellRenderer: (params: ICellRendererParams<Payment>) => {
          if (!params.data) return null;
          const { senderBank, senderCountry, receiverBank, receiverCountry } = params.data;
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-800">{senderBank}</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                {senderCountry}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{receiverBank}</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
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
            <div className="text-xs font-bold text-slate-900 font-sans">
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
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-800">
                {params.data.targetCurrency} {Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
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
            DRAFT: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Draft' },
            RISK_CHECKED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Risk Cleared' },
            RISK_HELD: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Risk Held' },
            FUNDING_ORDER_CREATED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Funding Order' },
            FUNDED_PAYPAL: { bg: 'bg-sky-50 text-sky-800 border-sky-200', label: 'PayPal Funded' },
            FUNDED_SIMULATED: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Demo Funded' },
            ROUTED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Route Selected' },
            SETTLEMENT_PENDING: { bg: 'bg-yellow-50 text-yellow-800 border-yellow-200', label: 'Settling' },
            SETTLED: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold', label: 'Settled' },
            SETTLEMENT_FAILED: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
            RECONCILED: { bg: 'bg-teal-50 text-teal-800 border-teal-200', label: 'Reconciled' },
          }[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: status };

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
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`font-semibold ${
                  isHigh ? 'text-rose-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {(score * 100).toFixed(2)}%
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-medium ${
                  isHigh
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : isMed
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
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
            return <span className="text-slate-400 text-xs font-mono">Uncommitted</span>;
          }
          return (
            <div className="font-mono text-xs text-slate-700 flex items-center gap-1">
              <span>{params.value.substring(0, 8)}...</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-800">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>{' '}
              <span className="text-slate-400 text-[11px]">
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
              className="px-3 py-1 text-xs font-medium text-[#0070e0] hover:text-white bg-blue-50 hover:bg-[#0070e0] border border-blue-200 hover:border-transparent rounded-full transition-all flex items-center gap-1 shadow-2xs"
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
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header with Quick Filter Search & Live Counters */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {payments.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Quick Filter Search & Export Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, bank, country..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={exportCsv}
            title="Export CSV"
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* AG Grid React Light Container */}
      <div className="ag-theme-quartz w-full h-[520px]">
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
            '<span class="ag-overlay-loading-center text-slate-500 font-sans text-xs">Loading operational payment ledger...</span>'
          }
          overlayNoRowsTemplate={
            '<span class="ag-overlay-no-rows-center text-slate-500 font-sans text-xs">No payment transactions match current filter.</span>'
          }
        />
      </div>
    </div>
  );
}
