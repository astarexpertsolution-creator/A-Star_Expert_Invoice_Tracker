import React from 'react';
import { Button, Badge } from '../components/UI';
import { Invoice, PaymentStatus } from '../types';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, Truck, Package, MapPin } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onBack: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onBack }) => {
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
    <div className="space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Workflow Progress */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 z-0" />
          {[
            { id: 'created', label: 'Invoiced', icon: CheckCircle, active: true },
            { id: 'payment', label: 'Payment', icon: Clock, active: invoice.paidAmount > 0 },
            { id: 'dispatch', label: 'Dispatch', icon: Truck, active: !!invoice.trackingNumber },
            { id: 'pod', label: 'POD', icon: CheckCircle, active: invoice.dispatchStatus === 'Delivered' }
          ].map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                step.active ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-stone-200 text-stone-300'
              }`}>
                <step.icon size={14} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step.active ? 'text-emerald-600' : 'text-stone-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm font-bold">
          <ArrowLeft size={18} /> Back to Invoices
        </button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Download size={18} /> PDF
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Printer size={18} /> Print
          </Button>
        </div>
      </div>

      <div className="bg-[var(--theme-card-bg,white)] rounded-2xl shadow-xl border border-border-base overflow-hidden max-w-4xl mx-auto transition-colors">
        {/* Header Section */}
        <div className="p-6 md:p-12 border-b border-border-base flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-bg-main/30">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-text-main uppercase tracking-tighter">{invoice.invoiceNumber}</h2>
              <Badge color={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-text-muted text-sm uppercase font-bold tracking-widest opacity-60">Issued on {invoice.invoiceDate}</p>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 opacity-60">Amount Due</p>
            <p className="text-3xl md:text-4xl font-black text-text-main tracking-tighter">₹{(invoice.grandTotal - invoice.paidAmount).toLocaleString()}</p>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider mt-1">Due by {invoice.dueDate}</p>
          </div>
        </div>

        <div className="p-6 md:p-12">
          {/* Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 opacity-60">From</p>
              <div className="space-y-1">
                <p className="font-bold text-text-main text-lg uppercase tracking-tight">A-Star Solutions</p>
                <p className="text-text-muted text-sm">Industrial Hub, Block 4</p>
                <p className="text-text-muted text-sm">Enterprise City, 10001</p>
                <p className="text-text-muted text-sm">billing@a-star.com</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 opacity-60">Bill To</p>
              <div className="space-y-1">
                <p className="font-bold text-text-main text-lg uppercase tracking-tight">{invoice.customerName}</p>
                <p className="text-text-muted text-sm">{invoice.billingAddress}</p>
                <p className="text-text-muted text-sm">Customer Records Linked</p>
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          {invoice.trackingNumber && (
            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row gap-6">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                     <Package className="text-blue-500" size={18} />
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Dispatch Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Carrier</p>
                        <p className="text-xs font-bold text-stone-700">{invoice.courierPartner || 'Not Specified'}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Tracking ID</p>
                        <p className="text-xs font-mono font-bold text-stone-700">{invoice.trackingNumber}</p>
                     </div>
                  </div>
               </div>
               {invoice.dispatchStatus === 'Delivered' && (
                 <div className="flex-1 space-y-4 border-l md:border-stone-200 md:pl-6">
                    <div className="flex items-center gap-2">
                       <MapPin className="text-emerald-500" size={18} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Delivery Confirmation</h4>
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
                       <p className="text-xs font-bold text-emerald-700 underline decoration-dotted">Proof of Delivery Verified (POD)</p>
                       {invoice.deliveryProofUrl && (
                          <a href={invoice.deliveryProofUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 font-bold hover:underline block mt-1">View POD Document →</a>
                       )}
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto -mx-6 md:mx-0 border border-border-base rounded-xl mb-12">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-bg-main">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Item Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center w-24">Qty</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right w-32">Unit Price</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-text-main text-sm">{item.productName}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider opacity-60">Tax: {item.taxPercentage}% included</p>
                    </td>
                    <td className="px-6 py-4 text-center text-text-main font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-text-muted text-sm">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-text-main">₹{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t border-border-base">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 opacity-60">Corporate Notes</p>
              <p className="text-text-muted text-sm leading-relaxed italic border-l-4 border-accent-sage/30 pl-4 py-2 bg-bg-main/30 rounded-r-xl">
                {invoice.notes || "Standard corporate protocols applied. No specific override notes listed."}
              </p>
            </div>
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-text-muted text-xs uppercase font-bold">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text-muted text-xs uppercase font-bold">
                <span>Tax Archive Total</span>
                <span>₹{invoice.taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-text-main border-t border-border-base pt-3 tracking-tighter">
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 text-xs font-bold uppercase">
                <span>Paid to Date</span>
                <span>-₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-text-main bg-bg-main p-6 rounded-2xl mt-4 border border-border-base shadow-inner">
                <span className="uppercase text-[10px] tracking-widest opacity-60">Balance Due</span>
                <span>₹{(invoice.grandTotal - invoice.paidAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-900 text-slate-400 text-center text-xs">
          <p>Thank you for your business! If you have any questions, please contact us at support@mybusiness.com</p>
        </div>
      </div>
    </div>
  );
};
