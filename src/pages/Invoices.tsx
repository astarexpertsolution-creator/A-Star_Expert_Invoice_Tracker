import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { Invoice, PaymentStatus } from '../types';
import { Search, Plus, Filter, Eye, Edit2, Trash2, CreditCard, Truck } from 'lucide-react';

interface InvoicesPageProps {
  invoices: Invoice[];
  onCreate: () => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onUpdatePayment: (invoice: Invoice) => void;
  onUpdateLogistics: (invoice: Invoice) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ invoices, onCreate, onView, onEdit, onDelete, onUpdatePayment, onUpdateLogistics }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'green';
      case PaymentStatus.PARTIALLY_PAID: return 'blue';
      case PaymentStatus.UNPAID: return 'yellow';
      case PaymentStatus.OVERDUE: return 'red';
      case PaymentStatus.DRAFT: return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-[var(--theme-card-bg,white)] p-4 md:p-6 rounded-3xl shadow-sm border border-border-base transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-none sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-300" size={18} />
            <Input 
              placeholder="Search enterprise billing..." 
              className="pl-12 h-12" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-bg-main rounded-xl flex items-center justify-center text-text-muted transition-colors duration-300 border border-border-base hidden sm:flex">
                <Filter size={18} />
             </div>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-48 h-12 py-0 rounded-xl"
            >
              <option value="All">All Payment Cycles</option>
              {Object.values(PaymentStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>
        <Button onClick={onCreate} className="gap-2 h-12 px-6 sm:px-8 w-full lg:w-auto">
          <Plus size={18} /> Create Invoice
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-base">
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Invoice #</th>
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Customer</th>
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Amount</th>
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Logistics</th>
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider text-center">Status</th>
                <th className="pb-4 font-semibold text-text-muted text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg-main transition-colors group">
                  <td className="py-4 font-medium text-text-main">{inv.invoiceNumber}</td>
                  <td className="py-4 text-text-main font-bold">{inv.customerName}</td>
                  <td className="py-4">
                    <div className="font-semibold text-text-main">₹{inv.grandTotal.toLocaleString()}</div>
                    <div className="text-[10px] text-text-muted">Paid: ₹{inv.paidAmount.toLocaleString()}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <Badge color={
                        inv.dispatchStatus === 'Delivered' ? 'green' : 
                        inv.dispatchStatus === 'Dispatched' ? 'blue' : 'slate'
                      } className="text-[9px] w-fit">
                        {inv.dispatchStatus || 'Pending'}
                      </Badge>
                      {inv.trackingNumber && (
                        <span className="text-[10px] font-bold text-stone-400 font-mono">{inv.trackingNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge color={getStatusColor(inv.status)}>{inv.status}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View" onClick={() => onView(inv)} className="h-8 w-8">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => onEdit(inv)} className="h-8 w-8">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Update Payment" onClick={() => onUpdatePayment(inv)} className="h-8 w-8 text-indigo-600">
                        <CreditCard size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Update Logistics" onClick={() => onUpdateLogistics(inv)} className="h-8 w-8 text-blue-600">
                        <Truck size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => onDelete(inv.id)} className="h-8 w-8 text-red-600">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
