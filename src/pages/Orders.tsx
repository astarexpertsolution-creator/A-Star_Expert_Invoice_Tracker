import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ShoppingBag, FileUp, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Orders: React.FC<{ onInvoiceCreate?: (po: PurchaseOrder) => void }> = ({ onInvoiceCreate }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poRef = collection(db, 'purchase_orders');
    const q = query(poRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseOrder[];
      setPurchaseOrders(pos);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'purchase_orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-sage animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Scanning Order Manifest...</p>
      </div>
    );
  }

  const openPoValue = purchaseOrders
    .filter(po => po.status === 'Pending')
    .reduce((sum, po) => sum + (po.totalAmount || 0), 0);

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
        {purchaseOrders.length > 0 ? (
          purchaseOrders.map((po) => (
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
                  <p className="text-2xl font-black text-text-main">₹{po.totalAmount?.toLocaleString() || 0}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                    View
                  </Button>
                  {po.status === 'Pending' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2"
                      onClick={() => onInvoiceCreate?.(po)}
                    >
                      <FileText size={14} /> Create Invoice <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-stone-50 rounded-[2rem] border border-dashed border-stone-200">
             <p className="text-xs font-black uppercase tracking-widest text-stone-300">No Orders in Protocol</p>
          </div>
        )}
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
                <span className="text-lg font-black text-accent-sage">₹{openPoValue.toLocaleString()}</span>
             </div>
             <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
               Total {purchaseOrders.filter(p => p.status === 'Pending').length} pending orders required fulfillment.
             </p>
           </div>
        </Card>
      </div>
    </div>
  );
};
