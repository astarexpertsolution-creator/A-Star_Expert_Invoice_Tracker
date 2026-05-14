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
  TrendingUp
} from 'lucide-react';
import { Lead, CRMStatus, LeadType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export const LeadsPage: React.FC<{ 
  externalLeads: Lead[], 
  loadingLeads: boolean,
  isBypassMode?: boolean,
  dbStatus?: 'connected' | 'error' | 'testing',
  onUpdate?: (id: string, data: any) => Promise<void>,
  onCreate?: (data: any) => Promise<void>
}> = ({ externalLeads, loadingLeads, isBypassMode, dbStatus, onUpdate, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'details'>('list');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update Forms State
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateAction, setUpdateAction] = useState<'meeting' | 'enquiry' | null>(null);
  const [updateValue, setUpdateValue] = useState('');

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
    
    let updates: any = {};
    if (updateAction === 'meeting') {
      updates = {
        status: CRMStatus.MEETING_COMPLETED,
        meetingNotes: updateValue,
        updatedAt: serverTimestamp()
      };
    } else if (updateAction === 'enquiry') {
      const version = (selectedLead.enquiryVersions?.length || 0) + 1;
      const newEnquiry = {
        id: Math.random().toString(36).substr(2, 9),
        version,
        details: updateValue,
        date: new Date().toISOString()
      };
      updates = {
        status: CRMStatus.ENQUIRY_RECEIVED,
        requirements: updateValue,
        enquiryVersions: [...(selectedLead.enquiryVersions || []), newEnquiry],
        updatedAt: serverTimestamp()
      };
    }

    if (onUpdate) {
      await onUpdate(selectedLead.id, updates);
      setShowUpdateModal(false);
      setUpdateValue('');
      setUpdateAction(null);
    }
    setIsSubmitting(false);
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
            <Button variant="outline" size="sm" className="gap-2">
              <History size={16} /> History
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-red-500 border-red-100 hover:bg-red-50">
              <X size={16} /> Mark Lost
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Workflow Action */}
            <Card className="border-accent-sage/30 bg-accent-sage/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp size={80} />
               </div>
               <div className="relative z-10 p-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-accent-sage mb-4">Pipeline Action Required</h3>
                  
                  <div className="flex flex-wrap gap-4">
                    {/* Flow: New Lead -> Meeting -> Enquiry -> Quotation */}
                    {selectedLead.status === CRMStatus.NEW_LEAD && (
                      <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium text-stone-600">The lead was recently created. Have you conducted the initial meeting?</p>
                        <Button 
                          variant="primary" 
                          className="gap-2 shadow-lg shadow-accent-sage/20"
                          onClick={() => { setUpdateAction('meeting'); setShowUpdateModal(true); }}
                        >
                          <MessageSquare size={18} /> Mark Meeting Happened
                        </Button>
                      </div>
                    )}

                    {selectedLead.status === CRMStatus.MEETING_COMPLETED && (
                      <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium text-stone-600">Meeting concluded. Did you receive a formal enquiry or specific requirements?</p>
                        <Button 
                          variant="primary" 
                          className="gap-2 shadow-lg shadow-accent-sage/20"
                          onClick={() => { setUpdateAction('enquiry'); setShowUpdateModal(true); }}
                        >
                          <ClipboardList size={18} /> Record Enquiry Received
                        </Button>
                      </div>
                    )}

                    {selectedLead.status === CRMStatus.ENQUIRY_RECEIVED && (
                      <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium text-stone-600">Enquiry received and validated. Proceed to generate quotation protocol.</p>
                        <Button 
                          variant="primary" 
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => alert('Quotation Generation Protocol - To be implemented in next step')}
                        >
                          <FileText size={18} /> Initiate Quotation Builder
                        </Button>
                      </div>
                    )}

                    {!([CRMStatus.NEW_LEAD, CRMStatus.MEETING_COMPLETED, CRMStatus.ENQUIRY_RECEIVED] as string[]).includes(selectedLead.status) && (
                      <p className="text-sm italic text-stone-400">Current status managed via specialized workflows.</p>
                    )}
                  </div>
               </div>
            </Card>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                  <User size={14} /> Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-stone-900">{selectedLead.contactPerson || 'N/A'}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{selectedLead.designation || 'Position Unspecified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-stone-300" />
                    <span className="text-xs font-medium text-stone-600">{selectedLead.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-stone-300" />
                    <span className="text-xs font-medium text-stone-600">{selectedLead.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                  <Building2 size={14} /> Lead Source Info
                </h3>
                <div className="space-y-4">
                   <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Source</p>
                      <p className="text-xs font-black text-stone-900">{selectedLead.leadSource || 'Organic / Manual'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Type</p>
                      <Badge variant="outline">{selectedLead.leadType || 'General'}</Badge>
                   </div>
                   {selectedLead.referredBy && (
                     <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Referred By</p>
                        <p className="text-xs font-bold text-accent-sage">{selectedLead.referredBy}</p>
                     </div>
                   )}
                </div>
              </Card>
            </div>

            {/* Notes & Requirements History */}
            <Card className="border-stone-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Information Logs</h3>
               </div>
               <div className="p-6 space-y-8">
                  {selectedLead.meetingNotes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-stone-400">
                         <MessageSquare size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Meeting Notes</span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm italic text-stone-600 leading-relaxed">
                        {selectedLead.meetingNotes}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-400">
                       <ClipboardList size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Current Requirements</span>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-600 leading-relaxed">
                      {selectedLead.requirements || 'No specific requirements recorded yet.'}
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
               </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-stone-200 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Pipeline Metrics</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-stone-500 font-medium">Capture Date</span>
                     <span className="text-xs font-bold text-stone-900">{formatDate(selectedLead.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-stone-500 font-medium">Last Activity</span>
                     <span className="text-xs font-bold text-stone-900">{selectedLead.updatedAt ? formatDate(selectedLead.updatedAt) : 'N/A'}</span>
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                     <p className="text-[10px] font-bold text-stone-400 uppercase mb-3">Appointments</p>
                     {selectedLead.appointmentDate ? (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                           <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Calendar size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Scheduled</span>
                           </div>
                           <p className="text-xs font-bold text-blue-900">{format(new Date(selectedLead.appointmentDate), 'PPPP')}</p>
                           <p className="text-[10px] text-blue-600 mt-0.5">{selectedLead.appointmentTime || 'Time unset'}</p>
                        </div>
                     ) : (
                        <Button variant="outline" size="sm" className="w-full text-[10px] uppercase font-black border-dashed">Schedule Appointment</Button>
                     )}
                  </div>
               </div>
            </Card>

            <Card className="p-6 bg-stone-900 text-white shadow-xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Internal Discussion</h3>
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
                <div className="p-8 space-y-6">
                  <div className="p-4 bg-accent-sage/5 border border-accent-sage/10 rounded-2xl flex gap-3">
                     <TrendingUp className="text-accent-sage shrink-0" size={20} />
                     <p className="text-xs text-accent-sage font-medium">Entering this information will automatically advance the lead status to <strong>{updateAction === 'meeting' ? 'Meeting Happened' : 'Received Enquiry'}</strong>.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">
                      {updateAction === 'meeting' ? 'Outcome / Discussion Points *' : 'Actual Enquiry / Requirements *'}
                    </label>
                    <textarea 
                      autoFocus
                      className="w-full min-h-[160px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-accent-sage/20 transition-all font-medium text-stone-800"
                      placeholder={updateAction === 'meeting' ? "What was discussed? Next steps agreed?" : "Enter the specific enquiry or requirements received..."}
                      value={updateValue}
                      onChange={e => setUpdateValue(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2]" 
                      isLoading={isSubmitting}
                      disabled={!updateValue.trim()}
                      onClick={handleUpdateStatus}
                    >
                      Update Pipeline Stage
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

  // COMPACT LIST VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Lead Pipeline</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Manage your active opportunities</p>
        </div>
        <Button className="gap-2 h-10 w-full sm:w-auto" onClick={() => setViewMode('create')}>
          <UserPlus size={18} /> New Lead Record
        </Button>
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
          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Compact Cards Grid */}
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
                    lead.status === CRMStatus.MEETING_COMPLETED ? 'indigo' :
                    lead.status === CRMStatus.ENQUIRY_RECEIVED ? 'orange' :
                    lead.status === CRMStatus.QUOTATION_SHARED ? 'blue' :
                    'green'
                  }
                >
                  {lead.status}
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
                   <div className="flex -space-x-1.5">
                      {/* Avatar placeholder */}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[8px] font-bold text-stone-400">
                        {lead.contactPerson?.[0] || 'U'}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
    </div>
  );
};
