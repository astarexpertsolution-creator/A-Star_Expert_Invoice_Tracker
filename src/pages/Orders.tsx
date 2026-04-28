import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ShoppingBag, Clock, CheckCircle2, FileUp, FileText, ArrowRight } from 'lucide-react';
import { PurchaseOrder } from '../types';

export const Orders: React.FC = () => {
  const purchaseOrders: PurchaseOrder[] = [
    { id: 'po-01', poNumber: 'PO/2026/KMCH/001', customerId: 'c1', customerName: 'KMCH Hospital', poDate: '2026-04-25', items: [], totalAmount: 145000, status: 'Pending' },
    { id: 'po-02', poNumber: 'PO/2026/PSG/042', customerId: 'c2', customerName: 'PSG Hospitals', poDate: '2026-04-26', items: [], totalAmount: 78200, status: 'Converted' },
    { id: 'po-03', poNumber: 'PO/2026/CITY/009', customerId: 'c3', customerName: 'City Clinic', poDate: '2026-04-27', items: [], totalAmount: 12500, status: 'Pending' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent-sage text-white rounded-xl shadow-lg shadow-accent-sage/20">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Purchase Order Desk</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Mapping customer requirements to fulfillment</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none h-10 gap-2 font-bold text-[10px] uppercase tracking-widest">
            <FileUp size={16} /> Upload PO
          </Button>
          <Button variant="primary" className="flex-1 sm:flex-none h-10 gap-2 font-bold text-[10px] uppercase tracking-widest">
            + Manual PO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {purchaseOrders.map((po) => (
          <Card key={po.id} className="relative group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h3 className="text-lg font-black text-text-main uppercase tracking-tighter">{po.poNumber}</h3>
                   <Badge color={po.status === 'Converted' ? 'green' : 'yellow'}>{po.status}</Badge>
                </div>
                <p className="text-sm text-text-muted font-medium">{po.customerName} • Received on {po.poDate}</p>
              </div>

              <div className="flex flex-col md:items-end">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Est. Order Value</p>
                <p className="text-2xl font-black text-text-main">₹{po.totalAmount.toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                  View Document
                </Button>
                {po.status === 'Pending' && (
                  <Button variant="primary" size="sm" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
                    <FileText size={14} /> Convert to Invoice <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <Card title="Conversion Analytics" subtitle="PO to Invoice Velocity">
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-border-base rounded-2xl">
             <p className="text-xs text-text-muted italic font-bold uppercase tracking-widest">Historical conversion chart module</p>
          </div>
        </Card>
        <Card title="Open Liabilities" subtitle="Unfulfilled Purchase Orders">
           <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-bg-main rounded-xl">
                <span className="text-xs font-bold text-text-main">Total Open POs</span>
                <span className="text-lg font-black text-accent-sage">₹225,000</span>
             </div>
             <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
               Average aging of open POs: <span className="text-text-main">3.2 Days</span>
             </p>
           </div>
        </Card>
      </div>
    </div>
  );
};
