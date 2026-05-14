import React, { useState, useEffect } from 'react';
import { Button, Input, Badge, Select } from '../components/UI';
import { Search, UserPlus, ChevronRight, Loader2, X, MoreVertical, CheckCircle2, FileText } from 'lucide-react';
import { Lead, CRMStatus, LeadType } from '../types';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { format } from 'date-fns';

export const LeadsPage: React.FC<{ externalLeads: Lead[], loadingLeads: boolean }> = ({ externalLeads, loadingLeads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'convert' | 'manage'>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const selectedLead = externalLeads.find(l => l.id === selectedLeadId) || null;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (typeof date === 'object' && date.toDate) return format(date.toDate(), 'dd MMM yyyy');
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const [activeVersionTab, setActiveVersionTab] = useState<'enquiry' | 'quote' | 'meeting'>('enquiry');
  const [newEnquiry, setNewEnquiry] = useState('');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [apptDate, setApptDate] = useState('');
  
  // Quotation Builder State
  const [quoteItems, setQuoteItems] = useState<{ productId: string, quantity: number }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    designation: '',
    leadSource: '',
    leadType: '' as LeadType | '',
    referredBy: '',
    email: '',
    phone: '',
    requirements: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  // Conversion State
  const [conversionData, setConversionData] = useState({
    taxNumber: '',
    billingAddress: '',
    poNumber: ''
  });

  useEffect(() => {
    // Maintain view mode if data changes
    if (viewMode === 'manage' && selectedLeadId) {
      const updated = externalLeads.find(l => l.id === selectedLeadId);
      if (!updated) {
        setViewMode('list');
        setSelectedLeadId(null);
      }
    }
  }, [externalLeads, selectedLeadId, viewMode]);

  const scheduleAppointment = async () => {
    if (!selectedLead || !apptDate) return;
    try {
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        status: CRMStatus.APPOINTMENT_SCHEDULED,
        appointmentDate: apptDate,
        updatedAt: serverTimestamp()
      });
      // Also add to tracker for Appointments screen
      await addDoc(collection(db, 'tracker'), {
        type: 'appointment',
        title: `Meeting: ${selectedLead.companyName}`,
        description: `Discovery session with ${selectedLead.contactPerson}`,
        date: apptDate,
        status: 'pending',
        leadId: selectedLead.id,
        createdAt: serverTimestamp()
      });
      setApptDate('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'leads');
    }
  };

  const completeMeeting = async () => {
    if (!selectedLead || !newMeetingNotes) return;
    try {
      await updateDoc(doc(db, 'leads', selectedLead.id), {
        status: CRMStatus.MEETING_COMPLETED,
        meetingNotes: newMeetingNotes,
        updatedAt: serverTimestamp()
      });
      setNewMeetingNotes('');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'leads');
    }
  };

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleCreateLead = async (e: React.FormEvent | React.MouseEvent, isDraft: boolean = false) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    const newLead = {
      ...formData,
      status: isDraft ? CRMStatus.DRAFT : CRMStatus.NEW_LEAD,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      console.log('Initiating lead creation sequence:', newLead);
      const docRef = await addDoc(collection(db, 'leads'), newLead);
      console.log('Lead created successfully with ID:', docRef.id);
      
      setViewMode('list');
      setSelectedLeadId(null);
      setFormData({
        companyName: '',
        contactPerson: '',
        designation: '',
        leadSource: '',
        leadType: '' as LeadType | '',
        referredBy: '',
        email: '',
        phone: '',
        requirements: '',
        appointmentDate: '',
        appointmentTime: ''
      });
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      setSubmissionError(error.message || 'Failed to create lead. Please check your connection.');
      // Do not re-throw here so we can handle it in UI
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
      setSelectedLeadId(null);
      setConversionData({ taxNumber: '', billingAddress: '', poNumber: '' });
      
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'customers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFlow = [
    CRMStatus.NEW_LEAD,
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

  const filteredLeads = externalLeads.filter(l => {
    const matchesSearch = l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (l.contactPerson?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loadingLeads) {
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

        <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <form 
            id="create-lead-form"
            onSubmit={(e) => handleCreateLead(e)} 
            className="p-8 space-y-8"
          >
            {submissionError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 uppercase tracking-wider animate-pulse">
                Error Trace: {submissionError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input 
                label="Company *" 
                placeholder="e.g. KMCH Hospital" 
                required 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
              <Input 
                label="Lead Name (Optional)" 
                placeholder="e.g. Dr. John Doe" 
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              />
              <Input 
                label="Designation of Person (Optional)" 
                placeholder="e.g. Medical Director" 
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
              <Input 
                label="Lead Source (Optional)" 
                placeholder="e.g. Medical Fair 2024" 
                value={formData.leadSource}
                onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
              />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Lead Type</label>
                <Select 
                  value={formData.leadType}
                  onChange={(e) => setFormData({...formData, leadType: e.target.value as LeadType})}
                  className="h-12"
                >
                  <option value="">Select Type</option>
                  {Object.values(LeadType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              {formData.leadType === LeadType.REFERRAL && (
                <Input 
                  label="Referred by *" 
                  placeholder="e.g. Dr. Rajesh" 
                  required
                  value={formData.referredBy}
                  onChange={(e) => setFormData({...formData, referredBy: e.target.value})}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Appointment Date (Optional)" 
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                />
                <Input 
                  label="Time (Optional)" 
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                />
              </div>

              <Input 
                label="Email (Optional)" 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input 
                label="Phone (Optional)" 
                placeholder="+91 000 000 0000" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Requirement Specification</label>
                <textarea 
                  className="w-full min-h-[120px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium"
                  placeholder="Detail the scientific requirements..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-stone-100">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black"
                onClick={() => setViewMode('list')}
              >
                Cancel
              </Button>
              <Button 
                id="draft-lead-button"
                type="button"
                variant="outline"
                className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black border-stone-200"
                isLoading={isSubmitting}
                onClick={(e) => handleCreateLead(e, true)}
              >
                Draft
              </Button>
              <Button 
                id="add-lead-submit-button"
                type="submit" 
                variant="primary" 
                className="flex-[2] h-12 uppercase tracking-[0.3em] text-[10px] font-black shadow-xl shadow-accent-sage/20"
                isLoading={isSubmitting}
              >
                Add Lead
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'manage' && selectedLead) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">{selectedLead.companyName}</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Lead Lifecycle Orchestration</p>
          </div>
          <Button variant="outline" onClick={() => {
            setViewMode('list');
            setSelectedLeadId(null);
          }} className="gap-2 text-[10px] uppercase font-black tracking-widest">
            <X size={16} /> Close Terminal
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Status Tracker */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current Phase</h3>
              <div className="space-y-3">
                {[
                  { status: CRMStatus.NEW_LEAD, label: 'Lead Created' },
                  { status: CRMStatus.YET_TO_MEET, label: 'Qualification' },
                  { status: CRMStatus.APPOINTMENT_SCHEDULED, label: 'Appointment' },
                  { status: CRMStatus.MEETING_COMPLETED, label: 'Meeting Done' },
                  { status: CRMStatus.ENQUIRY_RECEIVED, label: 'Enquiry Received' },
                  { status: CRMStatus.QUOTATION_SHARED, label: 'Quotation Shared' },
                  { status: CRMStatus.PO_RECEIVED, label: 'PO Received' }
                ].map((step, idx) => {
                  const isCompleted = Object.values(CRMStatus).indexOf(selectedLead.status) >= Object.values(CRMStatus).indexOf(step.status);
                  const isCurrent = selectedLead.status === step.status;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-tight ${
                        isCurrent ? 'text-text-main' : isCompleted ? 'text-emerald-600' : 'text-stone-300'
                      }`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-stone-900 rounded-2xl md:rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Protocol Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10 h-10 text-[10px] uppercase font-black tracking-widest"
                  onClick={() => handleStatusUpdate(selectedLead.id, CRMStatus.ON_HOLD)}
                >
                  ⚠ Put on Hold
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:bg-red-950/20 h-10 text-[10px] uppercase font-black tracking-widest"
                  onClick={() => handleStatusUpdate(selectedLead.id, CRMStatus.LOST)}
                >
                  ✕ Mark as Lost
                </Button>
                {selectedLead.status === CRMStatus.PO_RECEIVED && (
                  <Button 
                    variant="primary"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-emerald-500/20"
                    onClick={() => setViewMode('convert')}
                  >
                    🚀 Execute Onboarding
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Management Interface */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="flex border-b border-stone-100 flex-wrap">
                {[
                  { id: 'enquiry', label: 'Requirements & Enquiries' },
                  { id: 'meeting', label: 'Meeting Protocol' },
                  { id: 'quote', label: 'Quotation Versions' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveVersionTab(tab.id as any)}
                    className={`flex-1 py-4 px-4 text-[10px] uppercase font-black tracking-[0.2em] transition-all min-w-[120px] ${
                      activeVersionTab === tab.id ? 'bg-stone-50 text-accent-sage border-b-2 border-accent-sage' : 'text-stone-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeVersionTab === 'enquiry' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Log New Requirement / Enquiry Version</label>
                      <textarea 
                        className="w-full min-h-[120px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium text-stone-900"
                        placeholder="Detail specific enquiry parameters..."
                        value={newEnquiry}
                        onChange={(e) => setNewEnquiry(e.target.value)}
                      />
                      <Button 
                        disabled={!newEnquiry}
                        className="w-full uppercase tracking-widest text-[10px] font-black h-12"
                        onClick={async () => {
                          const version = (selectedLead.enquiryVersions?.length || 0) + 1;
                          const updatedVersions = [...(selectedLead.enquiryVersions || []), {
                            id: Math.random().toString(36).substr(2, 9),
                            version,
                            details: newEnquiry,
                            date: new Date().toISOString()
                          }];
                          await updateDoc(doc(db, 'leads', selectedLead.id), {
                            enquiryVersions: updatedVersions,
                            status: CRMStatus.ENQUIRY_RECEIVED
                          });
                          setNewEnquiry('');
                        }}
                      >
                        Capture Enquiry Version
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Enquiry History</h4>
                      <div className="space-y-4">
                        {(selectedLead.enquiryVersions || []).slice().reverse().map(ev => (
                          <div key={ev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                             <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-bold text-accent-sage uppercase tracking-widest">Version {ev.version}</span>
                               <span className="text-[9px] font-medium text-stone-400">{format(new Date(ev.date), 'MMM d, p')}</span>
                             </div>
                             <p className="text-xs text-stone-600 font-medium leading-relaxed">{ev.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeVersionTab === 'meeting' && (
                  <div className="space-y-8">
                    {!selectedLead.appointmentDate || selectedLead.status === CRMStatus.YET_TO_MEET ? (
                        <div className="space-y-4 p-6 md:p-8 bg-blue-50/50 rounded-2xl md:rounded-3xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Phase: Scheduling</h4>
                        </div>
                        <p className="text-xs text-blue-800/70 font-medium">Select a future coordinate for the product demonstration meeting.</p>
                        <input 
                          type="datetime-local"
                          className="w-full p-4 bg-white border border-blue-100 rounded-2xl text-sm outline-none font-bold text-blue-900"
                          value={apptDate}
                          onChange={(e) => setApptDate(e.target.value)}
                        />
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 h-12 uppercase text-[10px] tracking-widest font-black"
                          onClick={scheduleAppointment}
                        >
                          Confirm Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                          <div>
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Appointment Confirmed</span>
                             <p className="text-xs font-bold text-emerald-900 mt-1">{format(new Date(selectedLead.appointmentDate), 'PPPP @ p')}</p>
                          </div>
                          <Button variant="outline" className="h-8 text-[9px] uppercase font-black tracking-widest text-emerald-600 border-emerald-200">Reschedule</Button>
                        </div>

                        {selectedLead.status !== CRMStatus.MEETING_COMPLETED && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Post-Meeting Analysis</label>
                            <textarea 
                              className="w-full min-h-[120px] p-6 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none font-medium"
                              placeholder="Key takeaways from discussion..."
                              value={newMeetingNotes}
                              onChange={(e) => setNewMeetingNotes(e.target.value)}
                            />
                            <Button 
                              className="w-full uppercase tracking-widest text-[10px] font-black h-12"
                              onClick={completeMeeting}
                            >
                              Finalize Meeting Logs
                            </Button>
                          </div>
                        )}
                        
                        {selectedLead.meetingNotes && (
                          <div className="p-6 bg-stone-900 rounded-2xl md:rounded-3xl text-white">
                             <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Internal Meeting Report</h4>
                             <p className="text-xs text-stone-300 font-medium leading-relaxed">{selectedLead.meetingNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeVersionTab === 'quote' && (
                  <div className="space-y-8">
                    {/* Simplified Quotation Listing and Creation */}
                    <div className="flex flex-col gap-4">
                       <div className="p-8 md:p-12 text-center bg-stone-50 rounded-2xl md:rounded-[2rem] border border-dashed border-stone-200">
                          <FileText className="mx-auto text-stone-200 mb-4" size={48} />
                          <h4 className="text-sm font-black text-stone-400 uppercase tracking-widest">Pricing Versions Protocol</h4>
                          <p className="text-[10px] text-stone-400 mt-2 font-medium max-w-xs mx-auto">Track every quotation variant shared during negotiations.</p>
                       </div>
                       
                       <div className="space-y-4">
                          {(selectedLead.quotationVersions || []).map((qv, idx) => (
                             <div key={qv.id} className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between">
                                <div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-900 underline">V{qv.version}</span>
                                      <Badge color={qv.status === 'Approved' ? 'green' : 'blue'} className="text-[9px]">{qv.status}</Badge>
                                   </div>
                                   <p className="text-xs font-bold text-stone-500 mt-1">₹{qv.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                   {qv.status !== 'Approved' && (
                                     <Button 
                                       className="h-8 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white"
                                       onClick={async () => {
                                          const updated = (selectedLead.quotationVersions || []).map(q => 
                                            q.id === qv.id ? { ...q, status: 'Approved' as const } : q
                                          );
                                          await updateDoc(doc(db, 'leads', selectedLead.id), {
                                            quotationVersions: updated,
                                            status: CRMStatus.PO_RECEIVED // Approved quote leads to PO
                                          });
                                       }}
                                     >
                                        Approve
                                     </Button>
                                   )}
                                   <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-stone-400">View</Button>
                                </div>
                             </div>
                          ))}

                          <Button 
                            variant="outline" 
                            className="w-full border-dashed h-12 uppercase font-black text-[10px] tracking-widest text-stone-400 hover:text-stone-900"
                            onClick={async () => {
                               const version = (selectedLead.quotationVersions?.length || 0) + 1;
                               const newVersion = {
                                  id: Math.random().toString(36).substr(2, 9),
                                  version,
                                  items: [],
                                  totalAmount: 154000, // Mock calculation
                                  date: new Date().toISOString(),
                                  status: 'Sent' as const
                               };
                               await updateDoc(doc(db, 'leads', selectedLead.id), {
                                  quotationVersions: [...(selectedLead.quotationVersions || []), newVersion],
                                  status: CRMStatus.QUOTATION_SHARED
                               });
                            }}
                          >
                            + Draft New Quotation Variant
                          </Button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
            <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-200 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-900 border-b border-emerald-50 pb-4">Source Lead Profile</h3>
              <div className="space-y-4 pt-2">
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
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-600">Commercial Registration Details</h3>
            </div>
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
          </div>
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

      <div className="bg-white rounded-xl md:rounded-[1.5rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/80 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Company & Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Requirements</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Created</th>
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
                      <p className="text-[10px] font-bold text-stone-400">{formatDate(lead.createdAt)}</p>
                    </td>
                    <td className="px-6 py-5">
              <Badge color={
                lead.status === CRMStatus.DRAFT ? 'gray' :
                lead.status === CRMStatus.NEW_LEAD ? 'indigo' :
                lead.status === CRMStatus.CONVERTED ? 'green' : 
                lead.status === CRMStatus.QUOTATION_SHARED ? 'blue' :
                lead.status === CRMStatus.ENQUIRY_RECEIVED ? 'orange' :
                lead.status === CRMStatus.LOST ? 'red' :
                lead.status === CRMStatus.ON_HOLD ? 'gray' :
                'indigo'
              }>
                {lead.status}
              </Badge>
            </td>
            <td className="px-6 py-5">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    setViewMode('manage');
                  }}
                  className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all"
                >
                  Manage Protocol
                </button>
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
                                  setSelectedLeadId(lead.id);
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
