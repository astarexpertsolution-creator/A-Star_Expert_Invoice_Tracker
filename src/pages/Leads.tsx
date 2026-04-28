import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Select } from '../components/UI';
import { Search, Plus, UserPlus, Phone, Mail, FileText, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { Lead, CRMStatus } from '../types';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAddLead = async () => {
    const newLead: Omit<Lead, 'id'> = {
      companyName: 'New Enterprise Lead',
      contactPerson: 'Lead Contact',
      email: 'lead@example.com',
      phone: '0000000000',
      requirements: 'Enter lead requirements here...',
      status: CRMStatus.LEAD,
      notes: '',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'leads'), {
        ...newLead,
        createdAt: serverTimestamp() // Preferred over client time
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-sage animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Synchronizing CRM Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Lead Management</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Gathering & qualifying potential clients</p>
        </div>
        <Button className="gap-2 h-10 w-full sm:w-auto" onClick={handleAddLead}>
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
