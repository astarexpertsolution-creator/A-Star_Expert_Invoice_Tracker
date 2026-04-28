import React, { useState } from 'react';
import { Card, Button, Input, Badge, Select } from '../components/UI';
import { Search, Plus, UserPlus, Phone, Mail, FileText, ChevronRight, MessageSquare } from 'lucide-react';
import { Lead, CRMStatus } from '../types';
import { motion } from 'motion/react';

const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    companyName: 'KMCH Hospital',
    contactPerson: 'Dr. Ramesh Kumar',
    email: 'ramesh.kmch@example.com',
    phone: '9876543210',
    requirements: 'Bulk procurement of PCR Kits and Bio-safety cabinets.',
    status: CRMStatus.LEAD,
    notes: 'Initial inquiry via website. High priority.',
    createdAt: '2026-04-20',
  },
  {
    id: 'l2',
    companyName: 'PSG Hospitals',
    contactPerson: 'Mrs. Shanthi',
    email: 'shanthi.psg@example.com',
    phone: '9876500000',
    requirements: 'Consumables for diagnostic lab.',
    status: CRMStatus.APPOINTMENT,
    appointmentDate: '2026-04-30',
    notes: 'Appointment scheduled for product demo.',
    createdAt: '2026-04-22',
  }
];

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Lead Management</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Gathering & qualifying potential clients</p>
        </div>
        <Button className="gap-2 h-10 w-full sm:w-auto">
          <UserPlus size={18} /> Add New Lead
        </Button>
      </div>

      <div className="bg-[var(--theme-card-bg,white)] p-4 rounded-xl shadow-sm border border-border-base flex flex-col sm:flex-row gap-4 items-center transition-colors">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted opacity-60" size={18} />
          <Input 
            placeholder="Search leads by company or contact..." 
            className="pl-10 h-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select className="w-full sm:w-48 h-10 py-0 text-sm">
          <option>All Sources</option>
          <option>Website</option>
          <option>Referral</option>
          <option>Direct Call</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLeads.map((lead) => (
          <motion.div 
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:shadow-lg transition-all h-full" title={lead.companyName} subtitle={`Contact: ${lead.contactPerson}`}>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                   <div className="flex items-center gap-1.5"><Phone size={14} className="opacity-60" /> {lead.phone}</div>
                   <div className="flex items-center gap-1.5"><Mail size={14} className="opacity-60" /> {lead.email}</div>
                </div>
                
                <div className="bg-bg-main/50 p-4 rounded-xl border border-border-base/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-accent-sage" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Requirements</span>
                  </div>
                  <p className="text-sm text-text-main line-clamp-2">{lead.requirements}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge color={lead.status === CRMStatus.LEAD ? 'indigo' : 'green'}>
                    {lead.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2">
                      <MessageSquare size={14} /> Notes
                    </Button>
                    <Button variant="primary" size="sm" className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2">
                      Next Step <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
