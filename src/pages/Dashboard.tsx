import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, ShoppingCart, UserPlus, Users, Calendar, Package, Truck, LayoutDashboard } from 'lucide-react';
import { PaymentStatus, Invoice, Lead, CRMStatus } from '../types';
import { motion } from 'motion/react';

export const Dashboard: React.FC<{ 
  invoices: Invoice[], 
  leads: Lead[],
  trackerItems?: any[],
  products?: any[],
  onNavigate: (tab: string) => void 
}> = ({ invoices, leads, trackerItems = [], products = [], onNavigate }) => {
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const pendingAmount = totalAmount - totalPaid;

  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch (e) { return ''; }
  };

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Condensed Stats Row */}
      <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 no-scrollbar">
        {[
          { label: 'Total', value: invoices.length, color: 'text-stone-900', bg: 'bg-white' },
          { label: 'Paid', value: invoices.filter(i => i.status === PaymentStatus.PAID).length, color: 'text-emerald-600', bg: 'bg-emerald-50/30' },
          { label: 'Unpaid', value: invoices.filter(i => i.status === PaymentStatus.UNPAID).length, color: 'text-amber-600', bg: 'bg-amber-50/30' },
          { label: 'Partial', value: invoices.filter(i => i.status === PaymentStatus.PARTIALLY_PAID).length, color: 'text-blue-600', bg: 'bg-blue-50/30' },
          { label: 'Total Value', value: `₹${(totalAmount / 1000).toFixed(1)}k`, color: 'text-indigo-600', bg: 'bg-indigo-50/30' },
          { label: 'Open PO', value: `₹${(pendingAmount * 1.2 / 1000).toFixed(1)}k`, color: 'text-rose-600', bg: 'bg-rose-50/30' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border border-stone-200 rounded-2xl p-4 min-w-[140px] flex-1 shadow-sm transition-all hover:border-stone-300`}>
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-lg font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-stone-50/50 rounded-2xl md:rounded-[2rem] border border-stone-200/60 p-4 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-sm font-black uppercase tracking-widest text-stone-400">Jump to Module</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { id: 'leads', label: 'Leads', icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'quotations', label: 'Quotations', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
            { id: 'invoices', label: 'Invoices', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'appointments', label: 'Calendar', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'customers', label: 'Clients', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-rose-600', bg: 'bg-rose-50' },
            { id: 'suppliers', label: 'Suppliers', icon: Truck, color: 'text-stone-600', bg: 'bg-stone-100' },
            { id: 'products', label: 'Inventory', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map((m) => (
            <motion.button 
              key={m.id} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(m.id)}
              className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md hover:border-stone-200 group"
            >
              <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <m.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{m.label}</span>
            </motion.button>
          ))}
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
                      <td className="px-4 py-3.5 text-right font-bold text-text-muted transition-colors">
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
          <Card title="Protocol Feed" subtitle="Real-time Event Stream">
             <div className="space-y-6">
                {(trackerItems || []).slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                     <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          item.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                          item.type === 'appointment' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-stone-50 text-stone-500'
                        }`}>
                           {item.type === 'payment' ? <DollarSign size={14} /> : 
                            item.type === 'appointment' ? <Calendar size={14} /> : 
                            <Clock size={14} />}
                        </div>
                        {idx !== 3 && <div className="w-0.5 h-full bg-stone-100 my-1" />}
                     </div>
                     <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{item.title}</span>
                           <span className="text-[9px] font-bold text-stone-400">{formatDate(item.createdAt)}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-medium leading-relaxed">{item.description}</p>
                     </div>
                  </div>
                ))}
                {(trackerItems || []).length === 0 && (
                  <p className="text-[10px] text-stone-300 italic text-center py-4">No recent activity protocol recorded.</p>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full h-10 border border-stone-100 text-[9px] font-black uppercase tracking-widest hover:bg-stone-50"
                  onClick={() => onNavigate('appointments')}
                >
                  View Full Protocol History
                </Button>
             </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => onNavigate('leads')}
                className="w-full bg-[var(--theme-card-bg,white)] hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎯</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Add Lead</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Opportunity Entry</span>
                </div>
              </button>
              <button 
                onClick={() => onNavigate('customers')}
                className="w-full bg-[var(--theme-card-bg,white)] hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👥</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Add Customer</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Contact Sync</span>
                </div>
              </button>
              <button 
                onClick={() => onNavigate('invoices')}
                className="w-full bg-[var(--theme-card-bg,white)] hover:bg-bg-main border border-border-base rounded-2xl p-6 flex items-center gap-4 transition-all group shadow-sm active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💰</div>
                <div className="text-left">
                  <span className="block text-xs font-black text-text-main uppercase tracking-widest">Manage Payments</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Direct Entry</span>
                </div>
              </button>
          </div>

          <div className="bg-sidebar-bg rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col justify-between text-white shadow-xl overflow-hidden relative min-h-[240px]">
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
