import React from 'react';
import { Card } from '../components/UI';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, ShoppingCart } from 'lucide-react';
import { PaymentStatus, Invoice } from '../types';
import { SAMPLE_INVOICES } from '../constants';
import { Badge } from '../components/UI';

export const Dashboard: React.FC<{ invoices: Invoice[] }> = ({ invoices }) => {
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const pendingAmount = totalAmount - totalPaid;

  const stats = [
    { label: 'Total', value: invoices.length, color: 'text-text-main', border: 'border-border-base' },
    { label: 'Paid', value: invoices.filter(i => i.status === PaymentStatus.PAID).length, color: 'text-emerald-700', border: 'border-border-base' },
    { label: 'Unpaid', value: invoices.filter(i => i.status === PaymentStatus.UNPAID).length, color: 'text-amber-600', border: 'border-border-base' },
    { label: 'Partial', value: invoices.filter(i => i.status === PaymentStatus.PARTIALLY_PAID).length, color: 'text-blue-600', border: 'border-border-base' },
    { label: 'Overdue', value: invoices.filter(i => i.status === PaymentStatus.OVERDUE).length, color: 'text-rose-600', border: 'border-border-base' },
    { label: 'Pending', value: `$${(pendingAmount / 1000).toFixed(1)}k`, color: 'text-text-main', border: 'border-stone-300 shadow-sm' },
  ];

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'green';
      case PaymentStatus.PARTIALLY_PAID: return 'blue';
      case PaymentStatus.UNPAID: return 'yellow';
      case PaymentStatus.OVERDUE: return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white border rounded-xl p-5 ${stat.border}`}>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card title="Recent Invoices" subtitle="Transaction History Log" className="h-full flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-base">
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Invoice #</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-bg-main transition-colors text-[13px]">
                      <td className="px-4 py-3.5 font-medium text-text-main">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3.5 text-text-muted">{inv.customerName}</td>
                      <td className="px-4 py-3.5 font-semibold text-text-main">${inv.grandTotal.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge color={getStatusColor(inv.status)}>{inv.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-stone-400">
                        <button className="hover:text-text-main transition-colors cursor-pointer">•••</button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted italic">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
              <button className="w-full bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl p-6 flex flex-col justify-center items-center group transition-all">
                <span className="text-2xl mb-1">📦</span>
                <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 uppercase tracking-wide">Add Product</span>
              </button>
              <button className="w-full bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl p-6 flex flex-col justify-center items-center group transition-all">
                <span className="text-2xl mb-1">👥</span>
                <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 uppercase tracking-wide">Add Customer</span>
              </button>
              <button className="w-full bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl p-6 flex flex-col justify-center items-center group transition-all">
                <span className="text-2xl mb-1">💰</span>
                <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 uppercase tracking-wide">Record Payment</span>
              </button>
          </div>

          <div className="bg-sidebar-bg rounded-xl p-6 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Recent Payment</p>
              <p className="text-2xl font-bold">${invoices[0]?.paidAmount.toLocaleString() || "0.00"}</p>
              <p className="text-[11px] text-stone-400 italic">from {invoices[0]?.customerName || "N/A"}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl relative z-10 shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
