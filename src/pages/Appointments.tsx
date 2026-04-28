import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Calendar, MapPin, Clock, ChevronRight, UserCheck } from 'lucide-react';
import { Lead, CRMStatus } from '../types';
import { motion } from 'motion/react';

const APPOINTMENTS: (Lead & { time?: string; location?: string })[] = [
  {
    id: 'l2',
    companyName: 'PSG Hospitals',
    contactPerson: 'Mrs. Shanthi',
    email: 'shanthi.psg@example.com',
    phone: '9876500000',
    requirements: 'Consumables for diagnostic lab.',
    status: CRMStatus.APPOINTMENT,
    appointmentDate: '2026-04-30',
    time: '10:30 AM',
    location: 'Hospital Admin Block, 2nd Floor',
    notes: 'Appointment scheduled for product demo.',
    createdAt: '2026-04-22',
  }
];

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Conversion Center</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Managing appointments & client onboarding</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button variant="outline" className="gap-2 h-10 flex-1 sm:flex-none">
            Calendar View
          </Button>
          <Button className="gap-2 h-10 flex-1 sm:flex-none">
            <Calendar size={18} /> Schedule New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {appointments.map((apt) => (
          <motion.div 
            key={apt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="hover:border-accent-sage/50 group">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-64 space-y-4 border-b lg:border-b-0 lg:border-r border-border-base pb-6 lg:pb-0 lg:pr-8">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-12 h-12 rounded-2xl bg-accent-sage/10 text-accent-sage flex items-center justify-center">
                        <Calendar size={20} />
                     </div>
                     <div>
                       <p className="text-lg font-black text-text-main tracking-tight uppercase">{apt.appointmentDate}</p>
                       <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{apt.time}</p>
                     </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs text-text-muted font-bold">
                        <MapPin size={14} className="shrink-0 mt-0.5" />
                        <span>{apt.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted font-bold">
                        <Clock size={14} />
                        <span>Duration: 45 Mins</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-6">
                   <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-black text-text-main transition-colors group-hover:text-accent-sage">{apt.companyName}</h3>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Lead Conversion in Progress</p>
                      </div>
                      <div className="bg-bg-main p-4 rounded-xl border border-border-base">
                         <p className="text-sm text-text-main italic">"{apt.notes}"</p>
                      </div>
                   </div>

                   <div className="flex flex-col justify-center gap-3 sm:min-w-[180px]">
                      <Button className="gap-2 h-11 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700">
                        <UserCheck size={16} /> Onboard Customer
                      </Button>
                      <Button variant="outline" className="gap-2 h-11 text-[10px] font-black uppercase tracking-widest">
                         Reschedule
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
