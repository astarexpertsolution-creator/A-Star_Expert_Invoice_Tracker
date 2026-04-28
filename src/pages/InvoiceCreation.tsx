import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { Product, Customer, Invoice, InvoiceItem, PaymentStatus } from '../types';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

interface InvoiceCreationProps {
  products: Product[];
  customers: Customer[];
  onSave: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const InvoiceCreation: React.FC<InvoiceCreationProps> = ({ products, customers, onSave, onCancel }) => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');

  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity * item.taxPercentage / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', sku: '', quantity: 1, mrp: 0, actualMargin: 10, unitPrice: 0, taxPercentage: 0, lineTotal: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateUnitPrice = (mrp: number, margin: number) => {
    return mrp - (mrp * margin / 100);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productName = product.name;
        item.sku = product.sku;
        item.mrp = product.mrp || 0;
        item.actualMargin = product.baseMargin || 0;
        item.unitPrice = calculateUnitPrice(item.mrp, item.actualMargin);
        item.taxPercentage = product.taxPercentage;
      }
    }

    if (field === 'mrp' || field === 'actualMargin') {
      item.unitPrice = calculateUnitPrice(item.mrp, item.actualMargin);
    }
    
    item.lineTotal = (item.unitPrice * item.quantity) * (1 + item.taxPercentage / 100);
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSave = (isDraft: boolean) => {
    if (!selectedCustomer || items.length === 0) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    onSave({
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      billingAddress: selectedCustomer.billingAddress,
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      status: isDraft ? PaymentStatus.DRAFT : PaymentStatus.UNPAID,
      notes,
    });
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm font-bold">
          <ArrowLeft size={18} /> Back to Invoices
        </button>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleSave(true)}>Save Draft</Button>
          <Button onClick={() => handleSave(false)} className="gap-2 flex-1 sm:flex-none">
            <Save size={18} /> Final Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Invoice Basic Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              <Input label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </Card>

          <Card title="Line Items">
            <div className="space-y-6">
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border-base text-[10px] uppercase font-black tracking-widest text-text-muted">
                      <th className="pb-3">Product</th>
                      <th className="pb-3 text-center">MRP</th>
                      <th className="pb-3 text-center">Margin %</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Unit Price</th>
                      <th className="pb-3 text-right">Total</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-base">
                    {items.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4 pr-4">
                          <Select 
                            value={item.productId} 
                            onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                            className="h-10 py-0 text-xs"
                          >
                            <option value="">Select Product Node</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </Select>
                        </td>
                        <td className="py-4 px-2">
                           <Input 
                            type="number" 
                            value={item.mrp} 
                            onChange={(e) => updateItem(idx, 'mrp', parseFloat(e.target.value) || 0)}
                            className="h-10 text-center text-xs font-bold"
                          />
                        </td>
                        <td className="py-4 px-2">
                           <Input 
                            type="number" 
                            value={item.actualMargin} 
                            onChange={(e) => updateItem(idx, 'actualMargin', parseFloat(e.target.value) || 0)}
                            className="h-10 text-center text-xs font-bold text-accent-sage"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity} 
                            onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-10 text-center text-xs font-bold"
                          />
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="text-xs font-bold text-text-main opacity-60">₹{item.unitPrice.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-2 text-right font-black text-text-main">
                          ₹{item.lineTotal.toFixed(2)}
                        </td>
                        <td className="py-4 pl-2">
                          <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus size={16} /> Add Line Item
              </Button>
            </div>
          </Card>

          <Card title="Notes & Remarks">
            <textarea 
              className="w-full h-32 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
              placeholder="Enter any additional notes for the customer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer Details">
            <div className="space-y-4">
              <Select 
                label="Select Customer"
                value={selectedCustomer?.id || ''}
                onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>

              {selectedCustomer && (
                <div className="p-4 rounded-lg bg-slate-50 text-sm space-y-2">
                  <p><span className="font-semibold text-slate-700">Billing Address:</span><br/>{selectedCustomer.billingAddress}</p>
                  <p><span className="font-semibold text-slate-700">Email:</span> {selectedCustomer.email}</p>
                  <p><span className="font-semibold text-slate-700">Tax ID:</span> {selectedCustomer.taxNumber}</p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Invoice Summary">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-3">
                <span>Tax Total</span>
                <span>₹{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-4">Totals will be automatically updated as you add items</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
