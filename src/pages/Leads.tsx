import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Select } from '../components/UI';
import { Search, UserPlus, FileText, ChevronRight, Loader2, X, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Lead, CRMStatus } from '../types';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { format } from 'date-fns';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'convert'>('list');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    requirements: '',
    notes: ''
  });

  // Conversion State
  const [conversionData, setConversionData] = useState({
    taxNumber: '',
    billingAddress: '',
    poNumber: ''
  });

  useEffect(() => {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLead: Omit<Lead, 'id'> = {
      ...formData,
      status: CRMStatus.YET_TO_MEET,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'leads'), {
        ...newLead,
        createdAt: serverTimestamp()
      });
      setViewMode('list');
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        requirements: '',
        notes: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const seedMockLeads = async () => {
    const mockLeads = [
      {
        companyName: 'PSG Institute of Medical Sciences',
        contactPerson: 'Dr. Nirmala',
        email: 'nirmala.psg@hospital.in',
        phone: '+91 94432 12345',
        requirements: 'Requesting quotation for 5 automated DNA extractors and thermal cyclers.',
        status: CRMStatus.APPOINTMENT_SCHEDULED,
        notes: 'Follow-up after medical conference demo.'
      },
      {
        companyName: 'KMCH Specialty Center',
        contactPerson: 'Mr. Arun Kumar',
        email: 'arun@kmch.org',
        phone: '+91 98421 54321',
        requirements: 'Bulk procurement of PCR reagents and consumables for next quarter.',
        status: CRMStatus.ENQUIRY_RECEIVED,
        notes: 'Requested expedited delivery schedule.'
      },
      {
        companyName: 'Ganga Research Lab',
        contactPerson: 'Dr. Subramanian',
        email: 'subbu@gangahospital.com',
        phone: '+91 94421 98765',
        requirements: 'Interested in advanced sequencing platforms for genome research.',
        status: CRMStatus.YET_TO_MEET,
        notes: 'Referred by Dr. Rajesh.'
      },
      {
        companyName: 'Amrita Institute (Bio-Sciences)',
        contactPerson: 'Dr. Lakshmi',
        email: 'lakshmi@amrita.edu',
        phone: '+91 99945 12121',
        requirements: 'Infrastructure setup for new biotechnology wing. Full lab requirement.',
        status: CRMStatus.QUOTATION_SHARED,
        notes: 'Quotation sent on 10th May. Pending approval.'
      }
    ];

    try {
      for (const lead of mockLeads) {
        await addDoc(collection(db, 'leads'), {
          ...lead,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Failed to seed leads:', error);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: CRMStatus) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'leads');
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);

    try {
      // 1. Create Customer
      const customerData = {
        name: selectedLead.companyName,
        code: `CUST-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        contactPerson: selectedLead.contactPerson,
        mobile: selectedLead.phone,
        email: selectedLead.email,
        billingAddress: conversionData.billingAddress,
        taxNumber: conversionData.taxNumber,
        status: 'Active',
        leadId: selectedLead.id,
        createdAt: serverTimestamp()
      };
      
      const customerRef = await addDoc(collection(db, 'customers'), customerData);

      // 2. Create Initial Purchase Order entry in order management if PO provided
      if (conversionData.poNumber) {
        await addDoc(collection(db, 'purchase_orders'), {
          poNumber: conversionData.poNumber,
          customerId: customerRef.id,
          customerName: selectedLead.companyName,
          poDate: format(new Date(), 'yyyy-MM-dd'),
          status: 'Pending',
          items: [],
          totalAmount: 0,
          createdAt: serverTimestamp()
        });
      }

      // 3. Update Lead Status
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        status: CRMStatus.CONVERTED,
        customerId: customerRef.id
      });

      setViewMode('list');
      setSelectedLead(null);
      setConversionData({ taxNumber: '', billingAddress: '', poNumber: '' });
      
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'customers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFlow = [
    CRMStatus.YET_TO_MEET,
    CRMStatus.APPOINTMENT_SCHEDULED,
    CRMStatus.ENQUIRY_RECEIVED,
    CRMStatus.QUOTATION_SHARED,
  ];

  const getNextStatus = (currentStatus: CRMStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-sage animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Synchronizing CRM Database...</p>
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">New Enterprise Lead</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Initialize CRM Record Protocol</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')} className="gap-2 text-[10px] uppercase font-black tracking-widest">
            <X size={16} /> Back to List
          </Button>
        </div>

        <Card>
          <form onSubmit={handleCreateLead} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input 
                label="Company Name" 
                placeholder="e.g. KMCH Hospital" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
              <Input 
                label="Contact Person" 
                placeholder="e.g. Dr. John Doe" 
                required 
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Phone Number" 
                placeholder="+91 000 000 0000" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Requirement Specification</label>
                <textarea 
                  className="w-full min-h-[150px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium"
                  placeholder="Detail the scientific requirements..."
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Internal Strategic Notes</label>
                <textarea 
                  className="w-full min-h-[100px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium text-stone-500"
                  placeholder="Add any internal context..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-stone-100">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-14 uppercase tracking-widest text-[10px] font-black"
                onClick={() => setViewMode('list')}
              >
                Discard Draft
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-[2] h-14 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl shadow-accent-sage/20"
                isLoading={isSubmitting}
              >
                Register & Initialize Protocol
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    );
  }

  if (viewMode === 'convert' && selectedLead) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">Lead Conversion Protocol</h2>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-1">Transforming Lead to Registered Customer</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('list')} className="gap-2 text-[10px] uppercase font-black tracking-widest">
            <X size={16} /> Cancel Conversion
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card title="Source Lead Profile">
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Company</p>
                  <p className="text-base font-black text-emerald-950">{selectedLead.companyName}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Point of Contact</p>
                  <p className="text-sm font-bold text-stone-800">{selectedLead.contactPerson}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Contact Metadata</p>
                  <p className="text-xs font-medium text-stone-600">{selectedLead.phone}</p>
                  <p className="text-xs font-medium text-stone-600">{selectedLead.email}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-2" title="Commercial Registration Details">
            <form onSubmit={handleConvertLead} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Purchase Order (PO) Number" 
                  placeholder="e.g. PO/2024/COI/001" 
                  required 
                  value={conversionData.poNumber}
                  onChange={(e) => setConversionData({...conversionData, poNumber: e.target.value})}
                />
                <Input 
                  label="GST / Tax Identification Number" 
                  placeholder="33AAAAA0000A1Z5" 
                  required
                  value={conversionData.taxNumber}
                  onChange={(e) => setConversionData({...conversionData, taxNumber: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Official Billing Address</label>
                  <textarea 
                    className="w-full min-h-[120px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none font-medium"
                    placeholder="Enter full legal billing address for invoicing..."
                    required
                    value={conversionData.billingAddress}
                    onChange={(e) => setConversionData({...conversionData, billingAddress: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-stone-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-14 uppercase tracking-widest text-[10px] font-black"
                  onClick={() => setViewMode('list')}
                >
                  Hold Conversion
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-[2] h-14 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl bg-emerald-600 hover:bg-emerald-700"
                  isLoading={isSubmitting}
                >
                  Execute Onboarding Protocol
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Lead Management</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Gathering & qualifying potential clients</p>
        </div>
        <Button className="gap-2 h-10 w-full sm:w-auto" onClick={() => setViewMode('create')}>
          <UserPlus size={18} /> Add New Lead
        </Button>
      </div>

      <div className="bg-[var(--theme-card-bg,white)] p-4 rounded-xl shadow-sm border border-border-base flex flex-col gap-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted opacity-60" size={18} />
            <Input 
              placeholder="Search leads by company or contact..." 
              className="pl-10 h-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            className="w-full sm:w-64 h-10 py-0 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Lead Statuses</option>
            {Object.values(CRMStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', ...Object.values(CRMStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'bg-accent-sage text-white' 
                  : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/80 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Company & Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Requirements</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLeads.map((lead) => {
                const nextStatus = getNextStatus(lead.status);
                
                return (
                  <motion.tr 
                    key={lead.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-text-main group-hover:text-accent-sage transition-colors">{lead.companyName}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-text-muted flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-stone-300" /> {lead.contactPerson}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 flex items-center gap-2 italic">
                            {lead.phone} • {lead.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{lead.requirements}</p>
                    </td>
                    <td className="px-6 py-5">
                      <Badge color={
                        lead.status === CRMStatus.CONVERTED ? 'green' : 
                        lead.status === CRMStatus.QUOTATION_SHARED ? 'blue' :
                        lead.status === CRMStatus.ENQUIRY_RECEIVED ? 'orange' :
                        'indigo'
                      }>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        {lead.status === CRMStatus.CONVERTED ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[9px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
                            <CheckCircle2 size={12} /> Onboarded
                          </div>
                        ) : (
                          <>
                            {nextStatus ? (
                              <button
                                onClick={() => handleStatusUpdate(lead.id, nextStatus)}
                                className="h-8 px-4 text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-accent-sage hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-100 rounded-lg transition-all flex items-center gap-2"
                              >
                                {nextStatus.split(' ')[0]} <ChevronRight size={12} />
                              </button>
                            ) : lead.status === CRMStatus.QUOTATION_SHARED && (
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="h-8 px-4 text-[9px] uppercase font-black tracking-[0.1em] bg-emerald-600 hover:bg-emerald-700 shadow-md"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setViewMode('convert');
                                }}
                              >
                                Convert to PO
                              </Button>
                            )}
                          </>
                        )}
                        <button className="p-2 text-stone-300 hover:text-stone-600 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-stone-300">No active leads match the target parameters</p>
              <Button variant="outline" size="sm" onClick={seedMockLeads} className="h-9 text-[10px] uppercase font-black tracking-widest">
                Seed Demonstration Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
