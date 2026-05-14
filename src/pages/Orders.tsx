import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { ShoppingBag, FileUp, FileText, ArrowRight, Loader2, DollarSign, X } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { AnimatePresence, motion } from 'motion/react';

export const Orders: React.FC<{ 
  onInvoiceCreate?: (po: PurchaseOrder) => void,
  externalOrders?: PurchaseOrder[],
  loading?: boolean,
  isBypassMode?: boolean,
  onUpdate?: (id: string, data: any) => Promise<void>,
  onCreate?: (data: any) => Promise<void>
}> = ({ onInvoiceCreate, externalOrders = [], loading = false, isBypassMode, onUpdate, onCreate }) => {
  const purchaseOrders = externalOrders;
  const [isCreatingPo, setIsCreatingPo] = useState(false);
  const [newPo, setNewPo] = useState({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    customerName: '',
    totalAmount: 0,
    advanceAmount: 0
  });

  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleCreatePo = async () => {
    if (!onCreate) return;
    await onCreate({
      ...newPo,
      poDate: new Date().toISOString().split('T')[0],
      status: newPo.advanceAmount > 0 ? 'On Hold' : 'Pending',
      advancePaid: 0,
      items: [],
    });
    setIsCreatingPo(false);
    setNewPo({ poNumber: `PO-${Date.now().toString().slice(-6)}`, customerName: '', totalAmount: 0, advanceAmount: 0 });
  };

  // Removed internal listener, using externalOrders prop instead

  const handleRecordPayment = async () => {
    if (!selectedPo || !onUpdate) return;
    const newPaid = (selectedPo.advancePaid || 0) + paymentAmount;
    const totalAdvance = selectedPo.advanceAmount || 0;
    
    let newStatus = selectedPo.status;
    if (newPaid < totalAdvance && totalAdvance > 0) {
      newStatus = 'On Hold';
    } else if (newStatus === 'On Hold') {
      newStatus = 'Pending';
    }

    await onUpdate(selectedPo.id, {
      advancePaid: newPaid,
      status: newStatus
    });

    setSelectedPo(null);
    setPaymentAmount(0);
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-sage animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Scanning Order Manifest...</p>
      </div>
    );
  }

  const openPoValue = purchaseOrders
    .filter(po => po.status === 'Pending' || po.status === 'On Hold')
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
          <Button 
            variant="primary" 
            className="flex-1 sm:flex-none h-10 gap-2 font-bold text-[10px] uppercase tracking-widest"
            onClick={() => setIsCreatingPo(true)}
          >
            + Manual PO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {purchaseOrders.length > 0 ? (
          purchaseOrders.map((po) => {
            const isAwaitingAdvance = (po.advanceAmount || 0) > (po.advancePaid || 0);
            
            return (
              <Card key={po.id} className="relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-text-main uppercase tracking-tighter">{po.poNumber}</h3>
                      <Badge color={
                        po.status === 'Converted' ? 'green' : 
                        po.status === 'On Hold' ? 'red' : 
                        isAwaitingAdvance ? 'amber' : 'yellow'
                      }>
                        {po.status === 'On Hold' ? 'On Hold (Payment)' : isAwaitingAdvance ? 'Awaiting Advance' : po.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted font-medium">{po.customerName} • Received on {po.poDate}</p>
                    {po.advanceAmount && (
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                         Advance: ₹{po.advancePaid || 0} / ₹{po.advanceAmount}
                       </p>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Est. Order Value</p>
                    <p className="text-2xl font-black text-text-main">₹{po.totalAmount?.toLocaleString() || 0}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                      View
                    </Button>
                    {(po.status === 'Pending' || po.status === 'On Hold') && isAwaitingAdvance && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 px-4 text-[10px] font-black uppercase tracking-widest gap-2 text-emerald-600 border-emerald-100 bg-emerald-50/50"
                        onClick={() => {
                          setSelectedPo(po);
                          setPaymentAmount((po.advanceAmount || 0) - (po.advancePaid || 0));
                        }}
                      >
                        <DollarSign size={14} /> Record Advance
                      </Button>
                    )}
                    {po.status !== 'Converted' && !isAwaitingAdvance && (
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
            );
          })
        ) : (
          <div className="py-20 text-center bg-stone-50 rounded-[2rem] border border-dashed border-stone-200">
             <p className="text-xs font-black uppercase tracking-widest text-stone-300">No Orders in Protocol</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreatingPo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setIsCreatingPo(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card title="Initialize Purchase Order">
                <div className="absolute top-4 right-4">
                  <button onClick={() => setIsCreatingPo(false)} className="p-1 rounded-full hover:bg-stone-50 text-stone-400">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <Input 
                    label="PO Number" 
                    value={newPo.poNumber} 
                    onChange={(e) => setNewPo({...newPo, poNumber: e.target.value})} 
                  />
                  <Input 
                    label="Customer Name" 
                    placeholder="Search or enter customer..."
                    value={newPo.customerName} 
                    onChange={(e) => setNewPo({...newPo, customerName: e.target.value})} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Total PO Value" 
                      type="number"
                      value={newPo.totalAmount} 
                      onChange={(e) => setNewPo({...newPo, totalAmount: parseFloat(e.target.value) || 0})} 
                    />
                    <Input 
                      label="Advance Target" 
                      type="number"
                      value={newPo.advanceAmount} 
                      onChange={(e) => setNewPo({...newPo, advanceAmount: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setIsCreatingPo(false)}>Discard</Button>
                    <Button variant="primary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={handleCreatePo}>Draft Order</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedPo(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card title="Order Advance Receipt">
                <div className="absolute top-4 right-4">
                  <button onClick={() => setSelectedPo(null)} className="p-1 rounded-full hover:bg-stone-50 text-stone-400">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <Input 
                    label="Transaction Amount" 
                    type="number" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedPo(null)}>Cancel</Button>
                    <Button variant="primary" className="flex-1" onClick={handleRecordPayment}>Confirm Receipt</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
