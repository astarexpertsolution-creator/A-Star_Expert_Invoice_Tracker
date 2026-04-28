import React, { useState, useEffect } from 'react';
import { Sidebar, TopBar } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/Products';
import { CustomersPage } from './pages/Customers';
import { InvoicesPage } from './pages/Invoices';
import { InvoiceCreation } from './pages/InvoiceCreation';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Login } from './pages/Login';
import { SAMPLE_PRODUCTS, SAMPLE_CUSTOMERS, SAMPLE_INVOICES } from './constants';
import { Product, Customer, Invoice, PaymentStatus, PaymentEntry } from './types';
import { Card, Button, Input, Select } from './components/UI';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  
  // Sub-navigation state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleCreateInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices([newInvoice, ...invoices]);
    setIsCreatingInvoice(false);
    setActiveTab('invoices');
  };

  const handleUpdatePayment = () => {
    if (!payingInvoice) return;

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === payingInvoice.id) {
        const newPaidAmount = inv.paidAmount + paymentAmount;
        let newStatus = inv.status;
        
        if (newPaidAmount >= inv.grandTotal) {
          newStatus = PaymentStatus.PAID;
        } else if (newPaidAmount > 0) {
          newStatus = PaymentStatus.PARTIALLY_PAID;
        }

        return {
          ...inv,
          paidAmount: newPaidAmount,
          status: newStatus,
        };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    setPayingInvoice(null);
    setPaymentAmount(0);
  };

  const renderContent = () => {
    if (viewingInvoice) {
      return <InvoiceDetails invoice={viewingInvoice} onBack={() => setViewingInvoice(null)} />;
    }

    if (isCreatingInvoice) {
      return (
        <InvoiceCreation 
          products={products} 
          customers={customers} 
          onSave={handleCreateInvoice} 
          onCancel={() => setIsCreatingInvoice(false)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'products':
        return (
          <ProductsPage 
            products={products} 
            onAdd={(p) => setProducts([...products, { ...p, id: `p-${Date.now()}` }])}
            onEdit={(p) => setProducts(products.map(item => item.id === p.id ? p : item))}
            onDelete={(id) => setProducts(products.filter(p => p.id !== id))}
          />
        );
      case 'customers':
        return (
          <CustomersPage 
            customers={customers} 
            onAdd={(c) => setCustomers([...customers, { ...c, id: `c-${Date.now()}` }])}
            onEdit={(c) => setCustomers(customers.map(item => item.id === c.id ? c : item))}
            onDelete={(id) => setCustomers(customers.filter(c => c.id !== id))}
          />
        );
      case 'invoices':
        return (
          <InvoicesPage 
            invoices={invoices} 
            onCreate={() => setIsCreatingInvoice(true)}
            onView={(inv) => setViewingInvoice(inv)}
            onEdit={() => {}} // Placeholder
            onDelete={(id) => setInvoices(invoices.filter(i => i.id !== id))}
            onUpdatePayment={(inv) => {
              setPayingInvoice(inv);
              setPaymentAmount(inv.grandTotal - inv.paidAmount);
            }}
          />
        );
      case 'payments':
        return (
          <div className="flex items-center justify-center h-64 text-slate-500 italic">
            Payments Module - This page will list all payment transactions in the next version.
          </div>
        );
      default:
        return <Dashboard invoices={invoices} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingInvoice(null);
          setIsCreatingInvoice(false);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <main className="flex-1 min-w-0">
        <TopBar title={isCreatingInvoice ? 'Create Invoice' : viewingInvoice ? `Invoice: ${viewingInvoice.invoiceNumber}` : activeTab} />
        <div className="p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {payingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setPayingInvoice(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card title="Record Payment" subtitle={`Update payment for ${payingInvoice.invoiceNumber}`}>
                <div className="absolute top-4 right-4">
                  <button onClick={() => setPayingInvoice(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex justify-between items-center text-indigo-900">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Balance Due</p>
                      <p className="text-2xl font-bold">${(payingInvoice.grandTotal - payingInvoice.paidAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Grand Total</p>
                      <p className="text-lg font-medium opacity-80">${payingInvoice.grandTotal.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input 
                      label="Payment Amount" 
                      type="number" 
                      max={payingInvoice.grandTotal - payingInvoice.paidAmount}
                      value={paymentAmount} 
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                    />
                    <Input 
                      label="Payment Date" 
                      type="date" 
                      value={paymentDate} 
                      onChange={(e) => setPaymentDate(e.target.value)} 
                    />
                    <Select 
                      label="Payment Mode" 
                      value={paymentMode} 
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Credit Card</option>
                      <option>UPI / Online</option>
                      <option>Cheque</option>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setPayingInvoice(null)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleUpdatePayment}>Confirm Payment</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
