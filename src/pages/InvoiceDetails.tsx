import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { Invoice, PaymentStatus } from '../types';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={18} /> Back to Invoices
        </button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} /> Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer size={18} /> Print
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
              <Badge color={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-slate-500">Issued on {invoice.invoiceDate}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Amount Due</p>
            <p className="text-4xl font-black text-indigo-600">₹{(invoice.grandTotal - invoice.paidAmount).toLocaleString()}</p>
            <p className="text-slate-400 text-xs mt-1">Due by {invoice.dueDate}</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Address Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">From</p>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-lg">My Small Business Name</p>
                <p className="text-slate-600">123 Business Avenue, Suite 100</p>
                <p className="text-slate-600">City, State, ZIP Code</p>
                <p className="text-slate-600">contact@mybusiness.com</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Bill To</p>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-lg">{invoice.customerName}</p>
                <p className="text-slate-600">{invoice.billingAddress}</p>
                <p className="text-slate-600">Customer Email Placeholder</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden border border-slate-100 rounded-xl mb-12">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center w-24">Qty</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right w-32">Unit Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-500">Tax: {item.taxPercentage}% included</p>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₹{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t-2 border-slate-50">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Notes</p>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                {invoice.notes || "No additional notes provided for this invoice."}
              </p>
            </div>
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Tax</span>
                <span>₹{invoice.taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-100 pt-3">
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Paid to Date</span>
                <span>-₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-indigo-600 bg-indigo-50 p-4 rounded-xl mt-4">
                <span>Balance Due</span>
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
