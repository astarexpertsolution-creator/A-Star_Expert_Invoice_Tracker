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
    { label: 'Pending', value: `₹${(pendingAmount / 1000).toFixed(1)}k`, color: 'text-text-main', border: 'border-stone-300 shadow-sm' },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.slice(0, 4).map((stat, idx) => (
          <div key={idx} className="bg-white border border-border-base rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
              <div className="w-10 h-10 bg-bg-main rounded-xl flex items-center justify-center text-stone-300">
                <FileText size={20} />
              </div>
            </div>
          </div>
        ))}
        <div className="col-span-full lg:col-span-2 grid grid-cols-2 gap-6">
           <div className="bg-text-main border border-text-main rounded-3xl p-8 text-white shadow-xl shadow-stone-200">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Total Value</p>
            <p className="text-3xl font-black tracking-tighter">₹{(totalAmount / 1000).toFixed(1)}k</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-6 h-1 bg-emerald-500 rounded-full"></div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Collected: ₹{(totalPaid / 1000).toFixed(1)}k</p>
            </div>
          </div>
          <div className="bg-accent-sage border border-accent-sage rounded-3xl p-8 text-white shadow-xl shadow-accent-sage/20">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Inventory Value</p>
            <p className="text-3xl font-black tracking-tighter">₹{(pendingAmount / 1000).toFixed(1)}k</p>
             <div className="mt-4 flex items-center gap-2">
              <div className="w-6 h-1 bg-white/30 rounded-full"></div>
              <p className="text-[10px] uppercase font-bold text-white/60">Pending Audit</p>
            </div>
          </div>
        </div>
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
                      <td className="px-4 py-3.5 font-semibold text-text-main">₹{inv.grandTotal.toLocaleString()}</td>
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
          <div className="grid grid-cols-1 gap-4">
              <button className="w-full bg-white hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📦</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Add Product</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Catalog Entry</span>
                </div>
              </button>
              <button className="w-full bg-white hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👥</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Add Customer</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Contact Sync</span>
                </div>
              </button>
              <button className="w-full bg-white hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💰</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Record Payment</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Direct Entry</span>
                </div>
              </button>
          </div>

          <div className="bg-sidebar-bg rounded-3xl p-10 flex flex-col justify-between text-white shadow-xl overflow-hidden relative min-h-[240px]">
            <div className="relative z-10">
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-black mb-6">Recent Scientific Revenue</p>
              <p className="text-5xl font-black tracking-tighter mb-2">₹{invoices[0]?.paidAmount.toLocaleString() || "0.00"}</p>
              <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Source: {invoices[0]?.customerName || "N/A"}</p>
            </div>
            <div className="relative z-10 mt-10">
               <Badge className="bg-white/10 text-white border-none py-2 px-4">Transaction Verified ✓</Badge>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-sage rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
