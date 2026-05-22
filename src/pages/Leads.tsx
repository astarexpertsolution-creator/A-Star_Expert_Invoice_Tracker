import React, { useState, useEffect } from 'react';
import { Button, Input, Badge, Select, Card } from '../components/UI';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  Loader2, 
  X, 
  MoreVertical, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  Mail,
  Phone,
  Building2,
  User,
  History,
  TrendingUp,
  TrendingDown,
  CircleSlash,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  Package,
  FilePlus,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Lead, CRMStatus, LeadType, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export const LeadsPage: React.FC<{ 
  externalLeads: Lead[], 
  loadingLeads: boolean,
  products: Product[],
  isBypassMode?: boolean,
  dbStatus?: 'connected' | 'error' | 'testing',
  viewMode: 'list' | 'create' | 'details' | 'samples' | 'quotation',
  setViewMode: (val: 'list' | 'create' | 'details' | 'samples' | 'quotation') => void,
  selectedLeadId: string | null,
  setSelectedLeadId: (val: string | null) => void,
  onUpdate?: (id: string, data: any) => Promise<void>,
  onCreate?: (data: any) => Promise<void>
}> = ({ externalLeads, loadingLeads, products, isBypassMode, dbStatus, viewMode, setViewMode, selectedLeadId, setSelectedLeadId, onUpdate, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMStatus | 'All'>('All');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('grid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update Forms State
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateAction, setUpdateAction] = useState<'meeting' | 'enquiry' | 'appointment' | 'reschedule' | 'on_hold' | 'invalid' | 'negotiation' | 'approve_quotation' | null>(null);
  const [updateValue, setUpdateValue] = useState('');

  // Meeting Form State
  const [meetingFormData, setMeetingFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: '' as 'In Person' | 'Phone Call' | 'Online' | '',
    venue: '' as 'Client Site' | 'Public Location' | 'Our Office' | '',
    outcome: '' as 'Samples Required' | 'Shared Requirements' | 'On Hold' | 'Another Meeting Required' | '',
    onHoldReason: '',
    notes: '',
    rescheduledDate: '',
    rescheduledTime: ''
  });

  // Quotation Builder State
  const [quotationItems, setQuotationItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    mrp: number;
    margin: number;
    unitPrice: number;
    taxPercentage: number;
    total: number;
  }[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');

  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);

  const selectedLead = externalLeads.find(l => l.id === selectedLeadId) || null;

  const isFreshLead = (lead: Lead) => {
    const ca: any = lead.createdAt;
    if (!ca) return false;
    try {
      const createdDate = typeof ca === 'object' && ca !== null && 'toDate' in ca 
        ? ca.toDate() 
        : new Date(ca);
      if (isNaN(createdDate.getTime())) return false;
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays < 1;
    } catch (e) {
      return false;
    }
  };

  const getLeadDisplayStatus = (lead: Lead) => {
    if (lead.status === CRMStatus.NEW_LEAD || lead.status === CRMStatus.LEAD) {
      return isFreshLead(lead) ? 'Fresh Lead' : 'Lead';
    }
    return lead.status;
  };

  const [appointmentFormData, setAppointmentFormData] = useState({
    date: '',
    time: ''
  });

  const [enquiryDetails, setEnquiryDetails] = useState('');
  const [requirementInfo, setRequirementInfo] = useState('');
  const [quotationNotes, setQuotationNotes] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');

  const [directLeadInfo, setDirectLeadInfo] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
  });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (typeof date === 'object' && date.toDate) return format(date.toDate(), 'dd MMM yyyy');
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Form State for creation
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

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newLead = {
      ...formData,
      status: CRMStatus.NEW_LEAD,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (onCreate) {
      await onCreate(newLead);
      setViewMode('list');
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
    }
    setIsSubmitting(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead || !updateAction) return;
    setIsSubmitting(true);
    
    let updates: any = {
      updatedAt: serverTimestamp()
    };

    if (updateAction === 'appointment') {
      updates = {
        ...updates,
        status: CRMStatus.APPOINTMENT_SCHEDULED,
        appointmentDate: appointmentFormData.date,
        appointmentTime: appointmentFormData.time,
        notes: (selectedLead.notes || '') + `\nAppointment scheduled for ${appointmentFormData.date} at ${appointmentFormData.time}`
      };
    } else if (updateAction === 'reschedule') {
      updates = {
        ...updates,
        status: CRMStatus.RESCHEDULED,
        appointmentDate: appointmentFormData.date,
        appointmentTime: appointmentFormData.time,
        notes: (selectedLead.notes || '') + `\nAppointment rescheduled to ${appointmentFormData.date} at ${appointmentFormData.time}`
      };
    } else if (updateAction === 'on_hold') {
      updates = {
        ...updates,
        status: CRMStatus.ON_HOLD,
        onHoldReason: updateValue
      };
    } else if (updateAction === 'invalid') {
      updates = {
        ...updates,
        status: CRMStatus.INVALID_LEAD,
        notes: (selectedLead.notes || '') + `\nMarked as Invalid: ${updateValue}`
      };
    } else if (updateAction === 'meeting') {
      const { outcome, type, venue, date, onHoldReason, notes, rescheduledDate, rescheduledTime } = meetingFormData;
      
      updates = {
        ...updates,
        meetingDate: date,
        meetingType: type,
        meetingVenue: venue,
        meetingOutcome: outcome,
        meetingNotes: notes,
      };

      if (outcome === 'Samples Required') {
        setViewMode('samples');
        setShowUpdateModal(false);
        setIsSubmitting(false);
        return;
      } else if (outcome === 'Shared Requirements') {
        setViewMode('quotation');
        setShowUpdateModal(false);
        setCustomerEmail(selectedLead.email || '');
        setIsSubmitting(false);
        return;
      } else if (outcome === 'On Hold') {
        updates.status = CRMStatus.ON_HOLD;
        updates.onHoldReason = onHoldReason;
      } else if (outcome === 'Another Meeting Required') {
        updates.status = CRMStatus.RESCHEDULED;
        updates.appointmentDate = rescheduledDate;
        updates.appointmentTime = rescheduledTime;
      } else {
        updates.status = CRMStatus.MEETING_COMPLETED;
      }
    } else if (updateAction === 'enquiry') {
      const version = (selectedLead.enquiryVersions?.length || 0) + 1;
      const newEnquiry = {
        id: Math.random().toString(36).substr(2, 9),
        version,
        details: enquiryDetails || requirementInfo || updateValue,
        date: new Date().toISOString()
      };
      updates = {
        status: CRMStatus.ENQUIRY_RECEIVED,
        requirements: enquiryDetails || requirementInfo || updateValue,
        enquiryVersions: [...(selectedLead.enquiryVersions || []), newEnquiry]
      };
    } else if (updateAction === 'negotiation') {
      updates = {
        status: CRMStatus.NEGOTIATION,
        notes: (selectedLead.notes || '') + `\nNegotiation request: ${negotiationNotes}`
      };
    } else if (updateAction === 'approve_quotation') {
      updates = {
        status: CRMStatus.QUOTATION_APPROVED,
        notes: (selectedLead.notes || '') + `\nQuotation approved by client.`
      };
    }

    if (onUpdate) {
      await onUpdate(selectedLead.id, updates);
      setShowUpdateModal(false);
      setUpdateValue('');
      setUpdateAction(null);
      setEnquiryDetails('');
      setRequirementInfo('');
      setNegotiationNotes('');
    }
    setIsSubmitting(false);
  };

  const handleSaveSamples = async () => {
    if (!selectedLead || !onUpdate) return;
    setIsSubmitting(true);
    try {
      await onUpdate(selectedLead.id, {
        status: CRMStatus.SAMPLES_SENT,
        sampleProductIds: selectedSamples,
        meetingNotes: meetingFormData.notes,
        meetingDate: meetingFormData.date,
        meetingType: meetingFormData.type,
        meetingVenue: meetingFormData.venue,
        meetingOutcome: 'Samples Required',
        updatedAt: serverTimestamp()
      });
      setViewMode('details');
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const handleSaveQuotation = async () => {
    if (!onUpdate || !onCreate) return;
    setIsSubmitting(true);
    try {
      const totalAmount = quotationItems.reduce((sum, item) => sum + item.total, 0);
      
      const newQuotation: any = {
        id: Math.random().toString(36).substr(2, 9),
        version: selectedLead ? (selectedLead.quotationVersions?.length || 0) + 1 : 1,
        items: quotationItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          mrp: item.mrp,
          actualMargin: item.margin,
          unitPrice: item.unitPrice,
          taxPercentage: item.taxPercentage,
          lineTotal: item.total
        })),
        totalAmount,
        date: new Date().toISOString(),
        status: 'Sent',
        notes: quotationNotes
      };

      if (selectedLead) {
        await onUpdate(selectedLead.id, {
          status: CRMStatus.QUOTATION_SHARED,
          email: customerEmail,
          requirements: updateValue || selectedLead.requirements,
          quotationVersions: [...(selectedLead.quotationVersions || []), newQuotation],
          meetingNotes: meetingFormData.notes || selectedLead.meetingNotes,
          updatedAt: serverTimestamp()
        });
      } else {
        // Direct Quotation - Create new lead
        const newLead: any = {
          companyName: directLeadInfo.companyName,
          contactPerson: directLeadInfo.contactPerson,
          phone: directLeadInfo.phone,
          email: customerEmail,
          status: CRMStatus.QUOTATION_SHARED,
          quotationVersions: [newQuotation],
          requirements: updateValue,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await onCreate(newLead);
      }
      
      setQuotationNotes('');
      setDirectLeadInfo({ companyName: '', contactPerson: '', phone: '' });
      setViewMode('list');
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const addQuotationItem = (product: Product) => {
    const margin = product.baseMargin || 0;
    const unitPrice = product.mrp ? product.mrp * (1 + margin / 100) : product.unitPrice;
    
    setQuotationItems([...quotationItems, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      mrp: product.mrp || product.unitPrice,
      margin,
      unitPrice,
      taxPercentage: product.taxPercentage,
      total: unitPrice * (1 + product.taxPercentage / 100)
    }]);
  };

  const updateQuotationItem = (index: number, quantity: number, margin: number) => {
    const items = [...quotationItems];
    const item = items[index];
    item.quantity = quantity;
    item.margin = margin;
    item.unitPrice = item.mrp * (1 + margin / 100);
    item.total = item.unitPrice * quantity * (1 + item.taxPercentage / 100);
    setQuotationItems(items);
  };

  const removeQuotationItem = (index: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
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

  // CREATE VIEW
  if (viewMode === 'create') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setViewMode('list')} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-stone-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-main">New Lead</h2>
            <p className="text-xs text-text-muted font-medium">Create a new entry in CRM</p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto p-8 border-stone-200">
          <form onSubmit={handleCreateLead} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Name *" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              <Input label="Contact Person" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
              <Input label="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500">Lead Type</label>
                <Select value={formData.leadType} onChange={e => setFormData({...formData, leadType: e.target.value as LeadType})}>
                  <option value="">Select Type</option>
                  {Object.values(LeadType).map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500">Initial Requirements</label>
              <textarea 
                className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all"
                value={formData.requirements}
                onChange={e => setFormData({...formData, requirements: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setViewMode('list')}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Create Lead Record</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    );
  }

  // DETAILS VIEW
  if (viewMode === 'details' && selectedLead) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setViewMode('list'); setSelectedLeadId(null); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-stone-500" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">{selectedLead.companyName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="indigo">{selectedLead.status}</Badge>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Lead ID: {selectedLead.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setViewMode('list'); setSelectedLeadId(null); }}>
              <ArrowLeft size={16} /> Back to Pipeline
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <History size={16} /> History
            </Button>
          </div>
        </div>

        {/* Lead Progress Bar */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-stone-100" />
            
            <div className="relative flex justify-between">
              {[
                { label: 'Capture', statuses: [CRMStatus.NEW_LEAD, CRMStatus.LEAD] },
                { label: 'Appointment', statuses: [CRMStatus.APPOINTMENT_SCHEDULED, CRMStatus.RESCHEDULED] },
                { label: 'Meeting', statuses: [CRMStatus.MEETING_COMPLETED, CRMStatus.SAMPLES_SENT] },
                { label: 'Quotation', statuses: [CRMStatus.ENQUIRY_RECEIVED, CRMStatus.QUOTATION_SHARED, CRMStatus.NEGOTIATION] },
                { label: 'Finalized', statuses: [CRMStatus.QUOTATION_APPROVED] }
              ].map((stage, index, array) => {
                const isCompleted = array.findIndex(s => s.statuses.includes(selectedLead.status)) >= index;
                const isActive = stage.statuses.includes(selectedLead.status);
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2 z-10 relative group">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive ? 'bg-accent-sage text-white scale-110 shadow-lg shadow-accent-sage/20 ring-4 ring-accent-sage/10' :
                        isCompleted ? 'bg-accent-sage/20 text-accent-sage' : 'bg-white border-2 border-stone-100 text-stone-300'
                      }`}
                    >
                      {isCompleted && !isActive ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{index + 1}</span>}
                    </div>
                    <span 
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                        isActive ? 'text-accent-sage' : isCompleted ? 'text-stone-600' : 'text-stone-300'
                      }`}
                    >
                      {stage.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-stage-indicator"
                        className="absolute -bottom-1 w-1 h-1 bg-accent-sage rounded-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* High Priority Pipeline Actions */}
            <Card className="p-5 border-accent-sage/40 shadow-md bg-accent-sage/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TrendingUp size={100} />
               </div>
               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-sage mb-2">Pipeline Progress Control</h3>
                       <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-white border-accent-sage/30 text-accent-sage font-black text-[10px]">
                            {selectedLead.status}
                          </Badge>
                          <ArrowRight size={14} className="text-stone-300" />
                          <span className="text-xs font-black text-stone-600 uppercase tracking-widest">
                            {selectedLead.status === CRMStatus.NEW_LEAD || selectedLead.status === CRMStatus.LEAD || selectedLead.status === CRMStatus.DRAFT ? 'Next: Appointment' :
                             selectedLead.status === CRMStatus.APPOINTMENT_SCHEDULED || selectedLead.status === CRMStatus.RESCHEDULED ? 'Next: Meeting' :
                             selectedLead.status === CRMStatus.MEETING_COMPLETED || selectedLead.status === CRMStatus.SAMPLES_SENT ? 'Next: Enquiry' :
                             selectedLead.status === CRMStatus.ENQUIRY_RECEIVED || selectedLead.status === CRMStatus.QUOTATION_SHARED || selectedLead.status === CRMStatus.NEGOTIATION ? 'Next: Closure' :
                             'Stage: Finalized'}
                          </span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {/* Stage 1 Actions */}
                      {(selectedLead.status === CRMStatus.NEW_LEAD || selectedLead.status === CRMStatus.LEAD || selectedLead.status === CRMStatus.DRAFT) && (
                        <>
                          <Button 
                            variant="primary" 
                            className="gap-2 bg-accent-sage hover:bg-accent-sage/90 font-black shadow-lg shadow-accent-sage/20 px-6"
                            onClick={() => { setUpdateAction('appointment'); setShowUpdateModal(true); }}
                          >
                            <Calendar size={18} /> Schedule Appointment
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-orange-600 border-orange-200 hover:bg-orange-50 font-bold bg-white"
                            onClick={() => { setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}
                          >
                            <CircleSlash size={16} /> Put On Hold
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-red-500 border-red-200 hover:bg-red-50 font-bold bg-white"
                            onClick={() => { setUpdateAction('invalid'); setUpdateValue(''); setShowUpdateModal(true); }}
                          >
                            <TrendingDown size={16} /> Mark Invalid
                          </Button>
                        </>
                      )}

                      {/* Stage 2 Actions */}
                      {(selectedLead.status === CRMStatus.APPOINTMENT_SCHEDULED || selectedLead.status === CRMStatus.RESCHEDULED) && (
                        <>
                          <Button 
                            variant="primary" 
                            className="gap-2 bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 px-6"
                            onClick={() => { setUpdateAction('meeting'); setShowUpdateModal(true); }}
                          >
                            <CheckCircle2 size={18} /> Record Meeting Outcome
                          </Button>
                          <Button variant="outline" className="bg-white text-stone-600 font-bold border-stone-200" onClick={() => { setUpdateAction('reschedule'); setShowUpdateModal(true); }}>
                            Reschedule
                          </Button>
                          <Button variant="outline" className="bg-white text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => { setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}>
                            On Hold
                          </Button>
                        </>
                      )}

                      {/* Stage 3 Actions */}
                      {(selectedLead.status === CRMStatus.MEETING_COMPLETED || selectedLead.status === CRMStatus.SAMPLES_SENT) && (
                        <>
                          <Button 
                            variant="primary" 
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/20 px-6"
                            onClick={() => { setUpdateAction('enquiry'); setUpdateValue(''); setShowUpdateModal(true); }}
                          >
                            <ClipboardList size={18} /> Record Enquiry
                          </Button>
                          <Button variant="outline" className="bg-white gap-2 text-stone-600 font-bold border-stone-200" onClick={() => setViewMode('samples')}>
                            <Package size={18} /> Send Samples
                          </Button>
                          <Button variant="outline" className="bg-white text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => { setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}>
                            On Hold
                          </Button>
                        </>
                      )}

                      {/* Stage 4 Actions */}
                      {(selectedLead.status === CRMStatus.ENQUIRY_RECEIVED || selectedLead.status === CRMStatus.QUOTATION_SHARED || selectedLead.status === CRMStatus.NEGOTIATION) && (
                        <>
                          <Button 
                            variant="primary" 
                            className="gap-2 bg-orange-600 hover:bg-orange-700 font-bold shadow-lg shadow-orange-600/20 px-6"
                            onClick={() => { setViewMode('quotation'); setQuotationItems([]); setCustomerEmail(selectedLead.email || ''); }}
                          >
                            <FileText size={18} /> {selectedLead.quotationVersions?.length ? 'Revise Quotation' : 'Create Quotation'}
                          </Button>
                          
                          {selectedLead.quotationVersions?.length ? (
                            <>
                              <Button 
                                variant="outline" 
                                className="bg-white text-green-600 border-green-200 hover:bg-green-50 font-bold"
                                onClick={() => { setUpdateAction('approve_quotation'); setShowUpdateModal(true); }}
                              >
                                Quotation Approved
                              </Button>
                              <Button variant="outline" className="bg-white text-stone-600 font-bold border-stone-200" onClick={() => { setUpdateAction('negotiation'); setShowUpdateModal(true); }}>
                                Negotiation
                              </Button>
                            </>
                          ) : null}
                          <Button variant="outline" className="bg-white text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => { setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}>
                            On Hold
                          </Button>
                        </>
                      )}

                      {/* Reactivate / Move back from terminal states */}
                      {(selectedLead.status === CRMStatus.ON_HOLD || selectedLead.status === CRMStatus.INVALID_LEAD) && (
                        <Button 
                          variant="outline" 
                          className="gap-2 border-accent-sage text-accent-sage hover:bg-accent-sage/5 font-bold bg-white px-6"
                          onClick={() => { setUpdateAction('appointment'); setShowUpdateModal(true); }}
                        >
                          <RotateCcw size={18} /> Reactivate Pipeline
                        </Button>
                      )}
                    </div>
                  </div>
               </div>
            </Card>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-stone-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 flex items-center gap-2">
                  <User size={12} /> Contact Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-900">{selectedLead.contactPerson || 'N/A'}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{selectedLead.designation || 'Position Unspecified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 pl-0.5">
                    <Mail size={14} className="text-stone-300" />
                    <span className="text-[11px] font-medium text-stone-600 truncate">{selectedLead.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 pl-0.5">
                    <Phone size={14} className="text-stone-300" />
                    <span className="text-[11px] font-medium text-stone-600">{selectedLead.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-stone-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 flex items-center gap-2">
                  <Building2 size={12} /> Source Information
                </h3>
                <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[8px] font-bold text-stone-400 uppercase mb-0.5">Lead Source</p>
                        <p className="text-[11px] font-black text-stone-900">{selectedLead.leadSource || 'Organic'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-stone-400 uppercase mb-0.5">Lead Type</p>
                        <div className="flex"><Badge size="sm" variant="outline" className="text-[8px] py-0">{selectedLead.leadType || 'General'}</Badge></div>
                      </div>
                   </div>
                   {selectedLead.referredBy && (
                     <div className="pt-2 border-t border-stone-50">
                        <p className="text-[8px] font-bold text-stone-400 uppercase mb-0.5">Referred By</p>
                        <p className="text-[11px] font-bold text-accent-sage">{selectedLead.referredBy}</p>
                     </div>
                   )}
                </div>
              </Card>
            </div>

            {/* Notes & Requirements History */}
            <Card className="border-stone-200 shadow-sm overflow-hidden">
               <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-stone-500">Internal Notes</h3>
               </div>
               <div className="p-4 space-y-6">
                  {selectedLead.meetingNotes && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-stone-400">
                         <MessageSquare size={12} />
                         <span className="text-[8px] font-black uppercase tracking-widest">Meeting Notes</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs italic text-stone-600 leading-relaxed font-medium">
                        {selectedLead.meetingNotes}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-400">
                       <ClipboardList size={12} />
                       <span className="text-[8px] font-black uppercase tracking-widest">Requirements</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 leading-relaxed font-medium">
                      {selectedLead.requirements || 'No specific requirements recorded.'}
                    </div>
                  </div>

                  {selectedLead.enquiryVersions && selectedLead.enquiryVersions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-stone-100">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Enquiry Version History</h4>
                       <div className="space-y-3">
                         {selectedLead.enquiryVersions.slice().reverse().map(ev => (
                           <div key={ev.id} className="p-3 bg-white border border-stone-100 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[9px] font-black uppercase text-accent-sage">Version {ev.version}</span>
                                 <span className="text-[9px] text-stone-400 font-bold">{format(new Date(ev.date), 'dd MMM yyyy, p')}</span>
                              </div>
                              <p className="text-xs text-stone-600 line-clamp-2 italic">{ev.details}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  {selectedLead.quotationVersions && selectedLead.quotationVersions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-stone-100">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <FileText size={14} /> Quotation Versions
                       </h3>
                       <div className="space-y-3">
                         {selectedLead.quotationVersions.slice().reverse().map(qv => (
                           <div key={qv.id} className="p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                              <div className="flex justify-between items-center mb-2">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-stone-900">v{qv.version}</span>
                                    <Badge size="sm" color={qv.status === 'Approved' ? 'green' : qv.status === 'Rejected' ? 'red' : 'blue'}>{qv.status}</Badge>
                                 </div>
                                 <span className="text-[10px] text-stone-400 font-medium">{format(new Date(qv.date), 'dd MMM yyyy')}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                 <div>
                                   <p className="text-[10px] font-bold text-stone-500 uppercase">{qv.items.length} Products</p>
                                   <p className="text-sm font-black text-indigo-600">₹{qv.totalAmount.toLocaleString()}</p>
                                 </div>
                                 <Button variant="ghost" size="sm" className="h-7 text-[9px] uppercase font-black px-2 hover:bg-stone-50">View Details</Button>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
               </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4 border-stone-200 shadow-sm">
               <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">Pipeline Metrics</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">Captured</span>
                     <span className="text-[11px] font-bold text-stone-900">{formatDate(selectedLead.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-stone-500 font-bold uppercase tracking-tight">Last Update</span>
                     <span className="text-[11px] font-bold text-stone-900">{selectedLead.updatedAt ? formatDate(selectedLead.updatedAt) : 'N/A'}</span>
                  </div>
                  <div className="pt-3 border-t border-stone-100">
                     <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-2">Next Milestone</p>
                     {selectedLead.appointmentDate ? (
                        <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                           <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Calendar size={12} />
                              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Appointment</span>
                           </div>
                           <p className="text-[11px] font-bold text-blue-900">{format(new Date(selectedLead.appointmentDate), 'dd MMM yyyy')}</p>
                           <p className="text-[9px] text-blue-600 font-bold mt-0.5">{selectedLead.appointmentTime || 'TBD'}</p>
                        </div>
                     ) : (
                        <Button variant="outline" size="sm" className="w-full text-[9px] uppercase font-black border-dashed h-8">Schedule Call</Button>
                     )}
                  </div>
               </div>
            </Card>

            <Card className="p-6 bg-stone-900 text-white shadow-xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Internal Notes</h3>
               <textarea 
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-stone-300 placeholder:text-stone-600 outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                  placeholder="Internal notes (not visible to client)..."
               />
               <Button variant="ghost" className="w-full mt-2 h-8 text-[9px] uppercase font-black tracking-widest text-stone-400 hover:text-white hover:bg-white/5">
                 Save Internal Log
               </Button>
            </Card>
          </div>
        </div>

        {/* Status Update Modal */}
        <AnimatePresence>
          {showUpdateModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200"
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-stone-900">
                      {updateAction === 'meeting' ? 'Meeting Details & Outcome' : 'Enquiry Requirements'}
                    </h3>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Moving to next pipeline stage</p>
                  </div>
                  <button onClick={() => setShowUpdateModal(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  {updateAction === 'appointment' || updateAction === 'reschedule' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label="Appointment Date *" 
                          type="date" 
                          value={appointmentFormData.date} 
                          onChange={e => setAppointmentFormData({...appointmentFormData, date: e.target.value})} 
                        />
                        <Input 
                          label="Appointment Time *" 
                          type="time" 
                          value={appointmentFormData.time} 
                          onChange={e => setAppointmentFormData({...appointmentFormData, time: e.target.value})} 
                        />
                      </div>
                    </div>
                  ) : updateAction === 'meeting' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label="Meeting Date *" 
                          type="date" 
                          value={meetingFormData.date} 
                          onChange={e => setMeetingFormData({...meetingFormData, date: e.target.value})} 
                        />
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500">Meeting Type *</label>
                          <Select 
                            value={meetingFormData.type} 
                            onChange={e => setMeetingFormData({...meetingFormData, type: e.target.value as any})}
                          >
                            <option value="">Select Type</option>
                            <option value="In Person">In Person</option>
                            <option value="Phone Call">Phone Call</option>
                            <option value="Online">Online</option>
                          </Select>
                        </div>
                      </div>

                      {meetingFormData.type === 'In Person' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-xs font-bold text-stone-500">Venue *</label>
                          <Select 
                            value={meetingFormData.venue} 
                            onChange={e => setMeetingFormData({...meetingFormData, venue: e.target.value as any})}
                          >
                            <option value="">Select Venue</option>
                            <option value="Client Site">Client Site</option>
                            <option value="Public Location">Public Location</option>
                            <option value="Our Office">Our Office</option>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500">Meeting Outcome *</label>
                        <Select 
                          value={meetingFormData.outcome} 
                          onChange={e => setMeetingFormData({...meetingFormData, outcome: e.target.value as any})}
                        >
                          <option value="">Select Outcome</option>
                          <option value="Samples Required">They require samples</option>
                          <option value="Shared Requirements">They shared requirements</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Another Meeting Required">Another meeting required</option>
                        </Select>
                      </div>

                      {meetingFormData.outcome === 'On Hold' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <Input 
                            label="Reason for Hold *" 
                            placeholder="Why is it on hold?"
                            value={meetingFormData.onHoldReason} 
                            onChange={e => setMeetingFormData({...meetingFormData, onHoldReason: e.target.value})} 
                          />
                        </div>
                      )}

                      {meetingFormData.outcome === 'Another Meeting Required' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                          <Input 
                            label="Next Appointment Date *" 
                            type="date"
                            value={meetingFormData.rescheduledDate} 
                            onChange={e => setMeetingFormData({...meetingFormData, rescheduledDate: e.target.value})} 
                          />
                          <Input 
                            label="Next Appointment Time" 
                            type="time"
                            value={meetingFormData.rescheduledTime} 
                            onChange={e => setMeetingFormData({...meetingFormData, rescheduledTime: e.target.value})} 
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500">Discussion Points / Notes</label>
                        <textarea 
                          className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all"
                          placeholder="What was discussed?"
                          value={meetingFormData.notes}
                          onChange={e => setMeetingFormData({...meetingFormData, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {updateAction === 'enquiry' ? (
                        <>
                          <div className="p-4 bg-accent-sage/5 border border-accent-sage/10 rounded-2xl flex gap-3">
                             <TrendingUp className="text-accent-sage shrink-0" size={20} />
                             <p className="text-xs text-accent-sage font-medium">Entering enquiry requirements advances the pipeline.</p>
                          </div>
                          <div className="space-y-4">
                            <Input label="Enquiry Details" value={enquiryDetails} onChange={e => setEnquiryDetails(e.target.value)} placeholder="Main enquiry point..." />
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Additional Requirements Info *</label>
                              <textarea 
                                autoFocus
                                className="w-full min-h-[140px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all font-medium text-stone-800"
                                placeholder="Enter specific needs, deadlines, or variations..."
                                value={requirementInfo}
                                onChange={e => setRequirementInfo(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      ) : updateAction === 'negotiation' ? (
                        <div className="space-y-4">
                           <h4 className="text-sm font-bold text-stone-900">Negotiation Feedback</h4>
                           <textarea 
                            className="w-full min-h-[120px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all"
                            placeholder="What are the client's counter-proposals or objections?"
                            value={negotiationNotes}
                            onChange={e => setNegotiationNotes(e.target.value)}
                          />
                        </div>
                      ) : updateAction === 'on_hold' || updateAction === 'invalid' ? (
                        <div className="space-y-4">
                          <Input label="Reason / Remarks *" value={updateValue} onChange={e => setUpdateValue(e.target.value)} />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Comments *</label>
                          <textarea 
                            autoFocus
                            className="w-full min-h-[160px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all font-medium text-stone-800"
                            placeholder="Enter details..."
                            value={updateValue}
                            onChange={e => setUpdateValue(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <Button variant="outline" className="flex-1" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2]" 
                      isLoading={isSubmitting}
                      disabled={
                        updateAction === 'appointment' || updateAction === 'reschedule'
                          ? (!appointmentFormData.date || !appointmentFormData.time)
                          : updateAction === 'meeting' 
                            ? (!meetingFormData.date || !meetingFormData.type || !meetingFormData.outcome)
                            : updateAction === 'enquiry'
                              ? (!requirementInfo.trim())
                              : updateAction === 'on_hold' || updateAction === 'invalid'
                                ? (!updateValue.trim())
                                : false
                      }
                      onClick={handleUpdateStatus}
                    >
                      {meetingFormData.outcome === 'Samples Required' ? 'Select Samples' : 
                       meetingFormData.outcome === 'Shared Requirements' ? 'Build Quotation' : 
                       updateAction === 'negotiation' ? 'Record Negotiation' : 'Update Stage'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // SAMPLES SELECTION VIEW
  if (viewMode === 'samples' && selectedLead) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('details')} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-stone-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-main">Sample Selection</h2>
            <p className="text-xs text-text-muted font-medium">Select products requested as samples by {selectedLead.companyName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <Input 
                placeholder="Search products for samples..." 
                className="pl-10 h-12 rounded-2xl" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => {
                    if (selectedSamples.includes(product.id)) {
                      setSelectedSamples(selectedSamples.filter(id => id !== product.id));
                    } else {
                      setSelectedSamples([...selectedSamples, product.id]);
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedSamples.includes(product.id) 
                      ? 'border-accent-sage bg-accent-sage/5' 
                      : 'border-stone-100 hover:border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-stone-900">{product.name}</h4>
                    {selectedSamples.includes(product.id) && <CheckCircle2 size={16} className="text-accent-sage" />}
                  </div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.sku}</p>
                  <p className="text-xs text-stone-500 mt-1">{product.category}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
             <Card title="Selected Samples" className="p-6">
                <div className="space-y-4 min-h-[200px]">
                   {selectedSamples.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                        <Package size={40} />
                        <p className="text-[10px] font-black uppercase mt-2">Zero Samples Selected</p>
                     </div>
                   ) : (
                     <div className="space-y-2">
                       {selectedSamples.map(id => {
                         const p = products.find(prod => prod.id === id);
                         return (
                           <div key={id} className="flex justify-between items-center p-2 bg-stone-50 rounded-lg">
                              <span className="text-xs font-bold truncate max-w-[150px]">{p?.name}</span>
                              <button onClick={() => setSelectedSamples(selectedSamples.filter(sid => sid !== id))}>
                                <X size={14} className="text-stone-400 hover:text-red-500" />
                              </button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>

                <div className="pt-6 border-t border-stone-100 space-y-3">
                   <Button 
                     variant="primary" 
                     className="w-full" 
                     disabled={selectedSamples.length === 0} 
                     isLoading={isSubmitting}
                     onClick={handleSaveSamples}
                   >
                     Initiate Sample Protocol
                   </Button>
                   <Button variant="outline" className="w-full" onClick={() => setViewMode('details')}>Cancel</Button>
                </div>
             </Card>
          </div>
        </div>
      </motion.div>
    );
  }

  // QUOTATION BUILDER VIEW
  if (viewMode === 'quotation' && selectedLead) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode(selectedLead ? 'details' : 'list')} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-stone-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-main">Quotation Builder</h2>
            <p className="text-xs text-text-muted font-medium">
              {selectedLead ? `Generate price protocol for ${selectedLead.companyName}` : 'Generate Direct Quotation'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            <Card className="p-0 border-stone-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500">Quotation Line Items</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                    <input 
                      className="pl-8 pr-4 py-1 text-xs bg-white border border-stone-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/20"
                      placeholder="Add Product..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          const p = products.find(p => p.name.toLowerCase().includes(val.toLowerCase()));
                          if (p) {
                            addQuotationItem(p);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-stone-100 italic">
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase">Product</th>
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase">Qty</th>
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase">MRP</th>
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase">Margin %</th>
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase">Unit Price</th>
                          <th className="px-6 py-3 text-[10px] text-stone-400 font-bold uppercase text-right">Total</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                       {quotationItems.map((item, idx) => (
                         <tr key={idx}>
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-stone-800">{item.productName}</p>
                            </td>
                            <td className="px-6 py-4">
                               <input 
                                 type="number" 
                                 className="w-12 text-xs font-bold bg-transparent border-b border-stone-200 outline-none"
                                 value={item.quantity}
                                 onChange={(e) => updateQuotationItem(idx, parseInt(e.target.value) || 1, item.margin)}
                               />
                            </td>
                            <td className="px-6 py-4 text-xs">₹{item.mrp.toLocaleString()}</td>
                            <td className="px-6 py-4">
                               <input 
                                 type="number" 
                                 className="w-12 text-xs font-bold bg-transparent border-b border-stone-200 outline-none"
                                 value={item.margin}
                                 onChange={(e) => updateQuotationItem(idx, item.quantity, parseFloat(e.target.value) || 0)}
                               />
                            </td>
                            <td className="px-6 py-4 text-xs font-bold">₹{item.unitPrice.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-3">
                                  <span className="text-xs font-black text-indigo-600">₹{item.total.toLocaleString()}</span>
                                  <button onClick={() => removeQuotationItem(idx)}>
                                    <X size={14} className="text-stone-300 hover:text-red-500" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {quotationItems.length === 0 && (
                         <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-[10px] font-bold text-stone-300 uppercase tracking-widest italic">
                               No line items added to quotation structure
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Customer Dispatch Info</h4>
                  <div className="space-y-4">
                     {!selectedLead && (
                       <div className="p-4 bg-indigo-50 rounded-2xl space-y-4 mb-4 border border-indigo-100">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic">Direct Quotation Mode: Capturing Lead Info</p>
                          <Input 
                            label="Company Name *" 
                            value={directLeadInfo.companyName} 
                            onChange={e => setDirectLeadInfo({...directLeadInfo, companyName: e.target.value})} 
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Input 
                              label="Contact Person" 
                              value={directLeadInfo.contactPerson} 
                              onChange={e => setDirectLeadInfo({...directLeadInfo, contactPerson: e.target.value})} 
                            />
                            <Input 
                              label="Phone" 
                              value={directLeadInfo.phone} 
                              onChange={e => setDirectLeadInfo({...directLeadInfo, phone: e.target.value})} 
                            />
                          </div>
                       </div>
                     )}
                     <Input 
                       label="Send Quotation to Email *" 
                       placeholder="customer@example.com"
                       value={customerEmail}
                       onChange={e => setCustomerEmail(e.target.value)}
                     />
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500">Capture Requirements Log</label>
                        <textarea 
                          className="w-full min-h-[100px] p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                          placeholder="Summary of specific requirements..."
                          value={updateValue}
                          onChange={e => setUpdateValue(e.target.value)}
                        />
                     </div>
                  </div>
                </Card>

               <div className="p-8 bg-stone-900 rounded-3xl text-white space-y-6">
                   <div className="flex justify-between items-center text-stone-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Aggregate Total</span>
                      <span className="text-2xl font-black text-white">₹{quotationItems.reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-stone-500 border-t border-white/5 pt-4">
                      <span className="text-[10px] font-bold uppercase">Items count</span>
                      <span className="text-xs text-stone-300 font-black">{quotationItems.length} Products</span>
                   </div>
                   <Button 
                     variant="primary" 
                     className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 shadow-xl shadow-indigo-500/20"
                     disabled={quotationItems.length === 0 || !customerEmail || (!selectedLead && !directLeadInfo.companyName)}
                     isLoading={isSubmitting}
                     onClick={handleSaveQuotation}
                   >
                     Approve & Share Quotation
                   </Button>
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <Card title="Product Inventory" className="p-0 border-stone-200">
                <div className="p-4 border-b border-stone-100">
                   <input className="w-full text-xs font-medium p-2 bg-stone-50 rounded-lg outline-none" placeholder="Filter Products..." />
                </div>
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                   {products.map(p => (
                     <div 
                       key={p.id} 
                       onClick={() => addQuotationItem(p)}
                       className="p-3 border border-stone-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 cursor-pointer transition-all"
                     >
                        <p className="text-xs font-bold text-stone-800">{p.name}</p>
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-[9px] font-bold text-stone-400">₹{p.unitPrice.toLocaleString()}</span>
                           <div className="p-1 bg-stone-100 rounded-lg text-stone-400 hover:bg-indigo-600 hover:text-white">
                             <FilePlus size={10} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      </motion.div>
    );
  }

  // COMPACT LIST VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Lead Pipeline</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Manage active opportunities & quotations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 h-10 w-full sm:w-auto" onClick={() => {
               // Direct Quotation flow
               setViewMode('quotation');
               setQuotationItems([]);
               setCustomerEmail('');
               setSelectedLeadId(null); 
            }}>
              <FilePlus size={18} /> Direct Quotation
            </Button>
            <Button className="gap-2 h-10 w-full sm:w-auto" onClick={() => setViewMode('create')}>
              <UserPlus size={18} /> New Lead Record
            </Button>
          </div>
        </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <Input 
              placeholder="Filter by company, contact person..." 
              className="pl-10 h-10 bg-stone-50/50 border-none focus:ring-1 focus:ring-stone-200" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center w-full">
            <div className="flex-1 flex flex-wrap gap-2">
              {['All', CRMStatus.NEW_LEAD, CRMStatus.MEETING_COMPLETED, CRMStatus.ENQUIRY_RECEIVED].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === status 
                      ? 'bg-stone-900 text-white shadow-lg' 
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {status.replace('Lead Created', 'New')}
                </button>
              ))}
            </div>

            <div className="flex bg-stone-100 p-1 rounded-xl">
               <button 
                 onClick={() => setLayoutMode('grid')}
                 className={`p-1.5 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
               >
                 <LayoutGrid size={16} />
               </button>
               <button 
                 onClick={() => setLayoutMode('table')}
                 className={`p-1.5 rounded-lg transition-all ${layoutMode === 'table' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
               >
                 <ListIcon size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content: Card Grid or Table List */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((lead) => (
              <motion.div
                layout
                key={lead.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => { setSelectedLeadId(lead.id); setViewMode('details'); }}
                className="group bg-white p-5 rounded-3xl border border-stone-200 hover:border-accent-sage hover:shadow-xl hover:shadow-accent-sage/5 transition-all cursor-pointer relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 bg-accent-sage/10 rounded-full text-accent-sage">
                    <ChevronRight size={14} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Badge 
                    className="text-[9px]"
                    color={
                      lead.status === CRMStatus.NEW_LEAD ? 'gray' :
                      lead.status === CRMStatus.LEAD ? 'stone' :
                      lead.status === CRMStatus.APPOINTMENT_SCHEDULED ? 'indigo' :
                      lead.status === CRMStatus.MEETING_COMPLETED ? 'blue' :
                      lead.status === CRMStatus.ENQUIRY_RECEIVED ? 'orange' :
                      lead.status === CRMStatus.QUOTATION_SHARED ? 'indigo' :
                      lead.status === CRMStatus.QUOTATION_APPROVED ? 'green' :
                      lead.status === CRMStatus.ON_HOLD ? 'orange' :
                      lead.status === CRMStatus.INVALID_LEAD ? 'red' :
                      'gray'
                    }
                  >
                    {getLeadDisplayStatus(lead)}
                  </Badge>

                  <div>
                    <h3 className="text-sm font-black text-stone-900 line-clamp-1 group-hover:text-accent-sage transition-colors">{lead.companyName}</h3>
                    <p className="text-[10px] font-bold text-stone-400 mt-0.5 flex items-center gap-1.5 italic">
                      <User size={10} className="text-stone-300" /> {lead.contactPerson || 'Unknown Contact'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-50 flex items-center justify-between mt-auto">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Captured</span>
                        <span className="text-[10px] font-black text-stone-500 uppercase">{formatDate(lead.createdAt).split(' ')[0]} {formatDate(lead.createdAt).split(' ')[1]}</span>
                     </div>
                     <div className="flex items-center gap-1">
                        {(lead.status === CRMStatus.NEW_LEAD || lead.status === CRMStatus.LEAD || lead.status === CRMStatus.DRAFT) && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="h-7 w-7 p-0 rounded-full bg-accent-sage hover:bg-accent-sage/90"
                            onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('appointment'); setShowUpdateModal(true); }}
                            title="Schedule Appointment"
                          >
                            <Calendar size={12} />
                          </Button>
                        )}
                        {lead.status === CRMStatus.APPOINTMENT_SCHEDULED && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="h-7 w-7 p-0 rounded-full bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('meeting'); setShowUpdateModal(true); }}
                            title="Log Meeting"
                          >
                            <CheckCircle2 size={12} />
                          </Button>
                        )}
                        {(lead.status === CRMStatus.NEW_LEAD || lead.status === CRMStatus.LEAD || lead.status === CRMStatus.DRAFT || lead.status === CRMStatus.APPOINTMENT_SCHEDULED) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 w-7 p-0 rounded-full text-orange-500 border-orange-100 hover:bg-orange-50 bg-white"
                            onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}
                            title="Put On Hold"
                          >
                            <CircleSlash size={12} />
                          </Button>
                        )}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[8px] font-bold text-stone-400">
                          {lead.contactPerson?.[0] || 'U'}
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="overflow-hidden border-stone-200 shadow-sm p-0">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Company / Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Lead Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Date Captured</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-accent-sage/5 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedLeadId(lead.id); setViewMode('details'); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xs font-black text-stone-400 group-hover:bg-accent-sage group-hover:text-white transition-all">
                          {lead.companyName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-stone-900 group-hover:text-accent-sage transition-colors">{lead.companyName}</p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{lead.contactPerson || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        className="text-[9px]"
                        color={
                          lead.status === CRMStatus.NEW_LEAD ? 'gray' :
                          lead.status === CRMStatus.LEAD ? 'stone' :
                          lead.status === CRMStatus.APPOINTMENT_SCHEDULED ? 'indigo' :
                          lead.status === CRMStatus.MEETING_COMPLETED ? 'blue' :
                          lead.status === CRMStatus.ENQUIRY_RECEIVED ? 'orange' :
                          lead.status === CRMStatus.QUOTATION_SHARED ? 'indigo' :
                          lead.status === CRMStatus.QUOTATION_APPROVED ? 'green' :
                          lead.status === CRMStatus.ON_HOLD ? 'orange' :
                          lead.status === CRMStatus.INVALID_LEAD ? 'red' :
                          'gray'
                        }
                      >
                        {getLeadDisplayStatus(lead)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-stone-600">{lead.leadType || 'General'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-stone-900">{formatDate(lead.createdAt)}</p>
                      <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">{formatDate(lead.createdAt).split(',')[1] || 'Capturing...'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {(lead.status === CRMStatus.NEW_LEAD || lead.status === CRMStatus.LEAD || lead.status === CRMStatus.DRAFT) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 text-[10px] uppercase font-black tracking-widest border-accent-sage text-accent-sage hover:bg-accent-sage/5"
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('appointment'); setShowUpdateModal(true); }}
                            >
                              Appt
                            </Button>
                          )}
                          {lead.status === CRMStatus.APPOINTMENT_SCHEDULED && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 text-[10px] uppercase font-black tracking-widest border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('meeting'); setShowUpdateModal(true); }}
                            >
                              Meeting
                            </Button>
                          )}
                          {(lead.status !== CRMStatus.ON_HOLD && lead.status !== CRMStatus.INVALID_LEAD && lead.status !== CRMStatus.PO_RECEIVED) && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0 text-orange-400 hover:text-orange-600 hover:bg-orange-50"
                              onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); setUpdateAction('on_hold'); setUpdateValue(''); setShowUpdateModal(true); }}
                              title="Hold"
                            >
                              <CircleSlash size={14} />
                            </Button>
                          )}
                          <button className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredLeads.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed border-stone-100 rounded-[2rem]">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
               <TrendingUp size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Zero Target Matches</p>
              <p className="text-[10px] font-bold text-stone-300 uppercase">Adjust parameters or initialize new protocol</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setViewMode('create')} className="h-9 px-6 text-[10px] uppercase font-black tracking-widest">
              Add New Lead Record
            </Button>
          </div>
        )}
      </div>
    );
};
