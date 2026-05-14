import React, { useState, useEffect } from 'react';
import { Sidebar, TopBar, BottomNav } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/Products';
import { CustomersPage } from './pages/Customers';
import { InvoicesPage } from './pages/Invoices';
import { Orders } from './pages/Orders';
import { Suppliers } from './pages/Suppliers';
import { LeadsPage } from './pages/Leads';
import { AppointmentsPage } from './pages/Appointments';
import { CustomizePage } from './pages/Customize';
import { InvoiceCreation } from './pages/InvoiceCreation';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Login } from './pages/Login';
import { SAMPLE_PRODUCTS, SAMPLE_CUSTOMERS, SAMPLE_INVOICES } from './constants';
import { Product, Customer, Invoice, PaymentStatus, Lead } from './types';
import { Card, Button, Input, Select } from './components/UI';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Data State
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trackerItems, setTrackerItems] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingTracker, setLoadingTracker] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Sync Leads
    const leadsRef = collection(db, 'leads');
    const qLeads = query(leadsRef, orderBy('createdAt', 'desc'));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[]);
      setLoadingLeads(false);
    }, (error) => {
      console.error('Leads sync error:', error);
      setLoadingLeads(false);
    });

    // Sync Customers
    const custRef = collection(db, 'customers');
    const qCust = query(custRef, orderBy('createdAt', 'desc'));
    const unsubCust = onSnapshot(qCust, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[]);
      setLoadingCustomers(false);
    }, (error) => {
      console.error('Customers sync error:', error);
      setLoadingCustomers(false);
    });

    // Sync Invoices
    const invRef = collection(db, 'invoices');
    const qInv = query(invRef, orderBy('createdAt', 'desc'));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[]);
      setLoadingInvoices(false);
    }, (error) => {
      console.error('Invoices sync error:', error);
      setLoadingInvoices(false);
    });

    // Sync Tracker
    const trackerRef = collection(db, 'tracker');
    const qTracker = query(trackerRef, orderBy('createdAt', 'desc'));
    const unsubTracker = onSnapshot(qTracker, (snapshot) => {
      setTrackerItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingTracker(false);
    }, (error) => {
      console.error('Tracker sync error:', error);
      setLoadingTracker(false);
    });

    return () => {
      unsubLeads();
      unsubCust();
      unsubInv();
      unsubTracker();
    };
  }, [isAuthenticated]);
  
  // Sub-navigation state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [updatingLogistics, setUpdatingLogistics] = useState<Invoice | null>(null);

  // Logistics Form State
  const [logisticsData, setLogisticsData] = useState({
    trackingNumber: '',
    courierPartner: '',
    deliveryProofUrl: '',
    logisticsNotes: ''
  });

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Safety fallback: if auth takes too long, stop loading
    const timer = setTimeout(() => {
      setAuthInitialized(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setAuthInitialized(true);
    }
  }, [isAuthenticated]);

  if (!authInitialized && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Initializing System Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleCreateInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
      const invRef = collection(db, 'invoices');
      await addDoc(invRef, {
        ...newInvoiceData,
        createdAt: new Date().toISOString(), // Keeping string for model consistency or matching serverTimestamp()
        serverCreatedAt: serverTimestamp()
      });
      setIsCreatingInvoice(false);
      setActiveTab('invoices');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'invoices');
    }
  };

  const handleUpdatePayment = async () => {
    if (!payingInvoice) return;
    try {
      const newPaidAmount = payingInvoice.paidAmount + paymentAmount;
      let newStatus = payingInvoice.status;
      
      if (newPaidAmount >= payingInvoice.grandTotal) {
        newStatus = PaymentStatus.PAID;
      } else if (newPaidAmount > 0) {
        newStatus = PaymentStatus.PARTIALLY_PAID;
      }

      await updateDoc(doc(db, 'invoices', payingInvoice.id), {
        paidAmount: newPaidAmount,
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      setPayingInvoice(null);
      setPaymentAmount(0);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'invoices');
    }
  };

  const handleUpdateLogistics = async () => {
    if (!updatingLogistics) return;
    try {
      await updateDoc(doc(db, 'invoices', updatingLogistics.id), {
        ...logisticsData,
        dispatchStatus: logisticsData.deliveryProofUrl ? 'Delivered' : 'Dispatched' as any,
        updatedAt: serverTimestamp()
      });

      setUpdatingLogistics(null);
      setLogisticsData({ trackingNumber: '', courierPartner: '', logisticsNotes: '', deliveryProofUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'invoices');
    }
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
        return <Dashboard invoices={invoices} leads={leads} onNavigate={setActiveTab} />;
      case 'products':
        return (
          <ProductsPage 
            products={products} 
            onAdd={(p) => setProducts([...products, { ...p, id: `p-${Date.now()}` }])}
            onEdit={(p) => setProducts(products.map(item => item.id === p.id ? p : item))}
            onDelete={(id) => setProducts(products.filter(p => p.id !== id))}
          />
        );
      case 'leads':
        return <LeadsPage externalLeads={leads} loadingLeads={loadingLeads} />;
      case 'appointments':
        return <AppointmentsPage externalItems={trackerItems} />;
      case 'customers':
        return (
          <CustomersPage 
            customers={customers} 
            onAdd={(c) => {
              const custRef = collection(db, 'customers');
              addDoc(custRef, { ...c, createdAt: serverTimestamp() });
            }}
            onEdit={(c) => {
              updateDoc(doc(db, 'customers', c.id), { ...c, updatedAt: serverTimestamp() });
            }}
            onDelete={(id) => {
              // Delete logic
            }}
          />
        );
      case 'invoices':
        return (
          <InvoicesPage 
            invoices={invoices} 
            onCreate={() => setIsCreatingInvoice(true)}
            onView={(inv) => setViewingInvoice(inv)}
            onEdit={() => {}} // Placeholder
            onDelete={(id) => {}} // Delete logic
            onUpdatePayment={(inv) => {
              setPayingInvoice(inv);
              setPaymentAmount(inv.grandTotal - inv.paidAmount);
            }}
            onUpdateLogistics={(inv) => {
              setUpdatingLogistics(inv);
              setLogisticsData({
                trackingNumber: inv.trackingNumber || '',
                courierPartner: inv.courierPartner || '',
                logisticsNotes: inv.logisticsNotes || '',
                deliveryProofUrl: inv.deliveryProofUrl || ''
              });
            }}
          />
        );
      case 'orders':
        return (
          <Orders 
            onInvoiceCreate={(po) => {
              setIsCreatingInvoice(true);
              // In a more complex app, we'd pass PO data to pre-fill the form
            }} 
          />
        );
      case 'suppliers':
        return <Suppliers />;
      case 'payments':
        return (
          <div className="flex items-center justify-center h-64 text-slate-500 italic">
            Payments Module - This page will list all payment transactions in the next version.
          </div>
        );
      case 'customize':
        return <CustomizePage />;
      default:
        return <Dashboard invoices={invoices} />;
    }
  };

  const handleBack = () => {
    if (viewingInvoice) {
      setViewingInvoice(null);
    } else if (isCreatingInvoice) {
      setIsCreatingInvoice(false);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const showBack = activeTab !== 'dashboard' || viewingInvoice !== null || isCreatingInvoice;

  return (
    <div className="flex min-h-screen bg-bg-main font-sans antialiased text-text-main">
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
      
      <main className="flex-1 min-w-0 flex flex-col h-[100dvh]">
        <TopBar 
          title={isCreatingInvoice ? 'Create Invoice' : viewingInvoice ? `Invoice: ${viewingInvoice.invoiceNumber}` : activeTab} 
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          showBack={showBack}
          onBack={handleBack}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full pb-20 lg:pb-12">
          {renderContent()}
        </div>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingInvoice(null);
          setIsCreatingInvoice(false);
        }}
      />

      {/* Payment Modal */}
      <AnimatePresence>
        {payingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sidebar-bg/60 backdrop-blur-sm"
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
                  <button onClick={() => setPayingInvoice(null)} className="p-1 rounded-full hover:bg-bg-main text-text-muted">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[#F8F7F5] border border-border-base flex justify-between items-center text-text-main">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Balance Due</p>
                      <p className="text-2xl font-bold">₹{(payingInvoice.grandTotal - payingInvoice.paidAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Grand Total</p>
                      <p className="text-lg font-medium opacity-80">₹{payingInvoice.grandTotal.toLocaleString()}</p>
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
      {/* Logistics Modal */}
      <AnimatePresence>
        {updatingLogistics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-sidebar-bg/60 backdrop-blur-sm"
              onClick={() => setUpdatingLogistics(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card title="Dispatch Protocol" subtitle={`Logistic Tracking for ${updatingLogistics.invoiceNumber}`}>
                <div className="absolute top-4 right-4">
                  <button onClick={() => setUpdatingLogistics(null)} className="p-1 rounded-full hover:bg-bg-main text-text-muted">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Input 
                      label="Courier Partner" 
                      placeholder="e.g. BlueDart, Delhivery"
                      value={logisticsData.courierPartner} 
                      onChange={(e) => setLogisticsData({...logisticsData, courierPartner: e.target.value})} 
                    />
                    <Input 
                      label="Tracking ID" 
                      placeholder="Enter AWN / Tracking Number"
                      value={logisticsData.trackingNumber} 
                      onChange={(e) => setLogisticsData({...logisticsData, trackingNumber: e.target.value})} 
                    />
                    <Input 
                      label="Delivery Proof (URL/Link)" 
                      placeholder="Enter link to delivery confirmation"
                      value={logisticsData.deliveryProofUrl} 
                      onChange={(e) => setLogisticsData({...logisticsData, deliveryProofUrl: e.target.value})} 
                    />
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-text-muted ml-1">Logistics Notes</label>
                       <textarea 
                         className="w-full min-h-[80px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium"
                         placeholder="Any special handling instructions..."
                         value={logisticsData.logisticsNotes}
                         onChange={(e) => setLogisticsData({...logisticsData, logisticsNotes: e.target.value})}
                       />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setUpdatingLogistics(null)}>Cancel</Button>
                    <Button className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 uppercase tracking-widest text-[10px] font-black" onClick={handleUpdateLogistics}>Update Dispatch</Button>
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
