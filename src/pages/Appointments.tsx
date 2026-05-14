import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  MessageSquare,
  Plus,
  MoreVertical,
  X,
  Target,
  HelpCircle,
  FileText,
  Receipt,
  Edit3,
  CalendarClock,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday
} from 'date-fns';

enum TrackerType {
  PAYMENT = 'payment',
  APPOINTMENT = 'appointment',
  ORDER = 'order',
  DELIVERY = 'delivery',
  LEAD = 'lead',
  ENQUIRY = 'enquiry',
  QUOTATION = 'quotation',
  INVOICE = 'invoice'
}

interface ActionItem {
  id: string;
  type: TrackerType;
  title: string;
  description: string;
  time?: string;
  date?: string | any;
  status: 'pending' | 'completed';
  comments?: string;
  amount?: number;
}

// Generate some more realistic mock data for the current month
const generateMockData = (): Record<string, ActionItem[]> => {
  const data: Record<string, ActionItem[]> = {};
  const now = new Date();
  
  // Fill with some sample items
  const items: ActionItem[] = [
    { id: '1', type: TrackerType.PAYMENT, title: 'GCC Biotech Payment', description: 'Pending invoice #GCC-2024-01', amount: 125000, status: 'pending' },
    { id: '2', type: TrackerType.APPOINTMENT, title: 'PSG Hospital Demo', description: 'Real-time PCR machine demonstration', time: '10:30 AM', status: 'pending' },
    { id: '3', type: TrackerType.ORDER, title: 'Bulk Oligos Order', description: 'Order from Molecular Research Lab', status: 'pending' },
    { id: '4', type: TrackerType.DELIVERY, title: 'Cold Chain Dispatch', description: 'Reagents for Apollo Diagnostics', status: 'pending' },
    { id: '5', type: TrackerType.LEAD, title: 'New Hospital Prospect', description: 'Kovai Medical Center follow-up', status: 'pending' },
    { id: '6', type: TrackerType.ENQUIRY, title: 'DNA Extractor Inquiry', description: 'Technical specs requested by Amrita Uni', status: 'pending' },
    { id: '7', type: TrackerType.QUOTATION, title: 'Thermal Cycler Quote', description: 'Submit formal bid for ICMR project', status: 'pending' },
    { id: '8', type: TrackerType.INVOICE, title: 'Supply Batch #402', description: 'Generate invoice for SRM University', status: 'pending' },
  ];

  // Distribute items across the month, including some in the past to test rollover
  for (let i = 0; i < 30; i++) {
    const dayOffset = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!data[dateKey]) data[dateKey] = [];
    
    const randomItem = items[Math.floor(Math.random() * items.length)];
    // Randomize status: past items are more likely to be pending if we want to see rollover
    const status = Math.random() > 0.3 ? 'pending' : 'completed';
    
    data[dateKey].push({ 
      ...randomItem, 
      status: status as 'pending' | 'completed',
      id: Math.random().toString(36).substr(2, 9) 
    });
  }

  return data;
};

export const AppointmentsPage: React.FC<{ externalItems?: ActionItem[] }> = ({ externalItems = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allData, setAllData] = useState<Record<string, ActionItem[]>>(generateMockData());

  useEffect(() => {
    if (externalItems.length > 0) {
      setAllData(prev => {
        const newData = { ...prev };
        externalItems.forEach(item => {
          let dateObj: Date;
          try {
            // Handle Firestore timestamp OR string
            dateObj = item.date?.toDate ? item.date.toDate() : new Date(item.date);
          } catch (e) {
            dateObj = new Date();
          }
          
          if (isNaN(dateObj.getTime())) dateObj = new Date();
          
          const dateKey = format(dateObj, 'yyyy-MM-dd');
          if (!newData[dateKey]) newData[dateKey] = [];
          
          if (!newData[dateKey].some(i => i.id === item.id)) {
            newData[dateKey].push(item);
          }
        });
        return newData;
      });
    }
  }, [externalItems]);

  const [filter, setFilter] = useState<TrackerType | 'all'>('all');
  
  // Modal States
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [activeItem, setActiveItem] = useState<ActionItem | null>(null);
  const [comment, setComment] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editForm, setEditForm] = useState<Partial<ActionItem>>({});

  // Rollover pending items from past dates to today
  React.useEffect(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    let hasChanges = false;
    const newData = { ...allData };

    Object.keys(newData).forEach(dateKey => {
      // If date is in the past
      if (dateKey < todayKey) {
        const pastItems = newData[dateKey];
        const pendingItems = pastItems.filter(item => item.status === 'pending');
        
        if (pendingItems.length > 0) {
          hasChanges = true;
          
          // Remove pending items from past date
          newData[dateKey] = pastItems.filter(item => item.status !== 'pending');
          
          // Move them to today
          if (!newData[todayKey]) newData[todayKey] = [];
          
          // Add a "Delayed" prefix or property if needed, but here we just shift them
          const shiftedItems = pendingItems.map(item => ({
            ...item,
            title: item.title.startsWith('[ROLLOVER]') ? item.title : `[ROLLOVER] ${item.title}`
          }));
          
          newData[todayKey] = [...newData[todayKey], ...shiftedItems];
          
          // If past date is now empty, delete the key
          if (newData[dateKey].length === 0) {
            delete newData[dateKey];
          }
        }
      }
    });

    if (hasChanges) {
      setAllData(newData);
      console.log('Rollover complete: Pending items moved to today.');
    }
  }, []); // Run once on mount

  // Sync selected date when month changes to keep Day Protocol relevant
  React.useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setSelectedDate(startOfMonth(currentMonth));
    }
  }, [currentMonth, selectedDate]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="space-y-6 mb-8 px-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Calendar Tracker</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em]">{format(currentMonth, "MMMM yyyy")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth} className="p-2 h-9 w-9 rounded-xl">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="p-2 h-9 w-9 rounded-xl">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2 scroll-smooth">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            className="h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl flex-shrink-0 transition-all"
            onClick={() => setFilter('all')}
          >
            All Items
          </Button>
          {[
            { id: TrackerType.PAYMENT, label: 'Payments', color: 'bg-emerald-500' },
            { id: TrackerType.ORDER, label: 'Orders', color: 'bg-orange-500' },
            { id: TrackerType.DELIVERY, label: 'Deliveries', color: 'bg-purple-500' },
            { id: TrackerType.APPOINTMENT, label: 'Appointments', color: 'bg-blue-500' },
            { id: TrackerType.LEAD, label: 'Leads', color: 'bg-red-500' },
            { id: TrackerType.ENQUIRY, label: 'Enquiries', color: 'bg-amber-500' },
            { id: TrackerType.QUOTATION, label: 'Quotations', color: 'bg-cyan-500' },
            { id: TrackerType.INVOICE, label: 'Invoices', color: 'bg-indigo-500' },
          ].map((cat) => (
            <Button 
              key={cat.id}
              variant={filter === cat.id ? 'primary' : 'outline'} 
              className={`h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl flex-shrink-0 transition-all gap-1.5 md:gap-2`}
              onClick={() => setFilter(cat.id)}
            >
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${cat.color}`} />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormatStr = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, dateFormatStr);
        const cloneDay = day;
        const dateKey = format(day, 'yyyy-MM-dd');
        const items = (allData[dateKey] || []).filter(item => filter === 'all' || item.type === filter);
        
        days.push(
          <div
            key={day.toString()}
            className={`relative min-h-[100px] p-2 border border-stone-50 transition-all cursor-pointer hover:bg-stone-50 ${
              !isSameMonth(day, monthStart) ? "opacity-20" : ""
            } ${isSameDay(day, selectedDate) ? "bg-accent-sage/5 border-accent-sage/20 ring-1 ring-inset ring-accent-sage/10 rounded-xl z-10" : ""}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className={`text-xs font-black p-1.5 rounded-lg ${isToday(day) ? "bg-accent-sage text-white shadow-md shadow-accent-sage/20" : "text-stone-500"}`}>
                {formattedDate}
              </span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {items.slice(0, 4).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.type === TrackerType.PAYMENT ? 'bg-emerald-500' :
                    item.type === TrackerType.APPOINTMENT ? 'bg-blue-500' :
                    item.type === TrackerType.ORDER ? 'bg-orange-500' :
                    item.type === TrackerType.DELIVERY ? 'bg-purple-500' :
                    item.type === TrackerType.LEAD ? 'bg-red-500' :
                    item.type === TrackerType.ENQUIRY ? 'bg-amber-500' :
                    item.type === TrackerType.QUOTATION ? 'bg-cyan-500' :
                    'bg-indigo-500'
                  }`}
                />
              ))}
              {items.length > 4 && (
                <span className="text-[8px] font-bold text-stone-400">+{items.length - 4}</span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">{rows}</div>;
  };

  const handleMarkComplete = (item: ActionItem) => {
    setActiveItem(item);
    setIsCommentModalOpen(true);
  };

  const handleOpenReschedule = (item: ActionItem) => {
    setActiveItem(item);
    setRescheduleDate(format(selectedDate, 'yyyy-MM-dd'));
    setIsRescheduleModalOpen(true);
  };

  const handleOpenEdit = (item: ActionItem) => {
    setActiveItem(item);
    setEditForm(item);
    setIsEditModalOpen(true);
  };

  const submitReschedule = () => {
    if (!activeItem || !rescheduleDate) return;
    
    const sourceDateKey = format(selectedDate, 'yyyy-MM-dd');
    const targetDateKey = rescheduleDate;
    
    const newData = { ...allData };
    
    // Remove from source
    newData[sourceDateKey] = newData[sourceDateKey].filter(it => it.id !== activeItem.id);
    
    // Add to target with comment
    const updatedItem = { 
      ...activeItem, 
      comments: `Rescheduled: ${comment}${activeItem.comments ? ' | ' + activeItem.comments : ''}` 
    };
    
    if (!newData[targetDateKey]) newData[targetDateKey] = [];
    newData[targetDateKey].push(updatedItem);
    
    setAllData(newData);
    setIsRescheduleModalOpen(false);
    setComment('');
    setActiveItem(null);
  };

  const submitEdit = () => {
    if (!activeItem) return;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const updatedItems = allData[dateKey].map(it => 
      it.id === activeItem.id ? { ...it, ...editForm } as ActionItem : it
    );

    setAllData({
      ...allData,
      [dateKey]: updatedItems
    });

    setIsEditModalOpen(false);
    setActiveItem(null);
  };

  const deleteItem = (id: string) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setAllData({
      ...allData,
      [dateKey]: allData[dateKey].filter(it => it.id !== id)
    });
  };

  const submitCompletion = () => {
    if (!activeItem) return;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const updatedItems = allData[dateKey].map(it => 
      it.id === activeItem.id ? { ...it, status: 'completed' as const, comments: comment } : it
    );

    setAllData({
      ...allData,
      [dateKey]: updatedItems
    });

    setIsCommentModalOpen(false);
    setComment('');
    setActiveItem(null);
  };

  const selectedDateItems = (allData[format(selectedDate, 'yyyy-MM-dd')] || []).filter(item => filter === 'all' || item.type === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Calendar Column */}
        <div className="xl:col-span-8 space-y-6">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/50">
            {[
              { color: 'bg-emerald-500', label: 'Payments' },
              { color: 'bg-blue-500', label: 'Appointments' },
              { color: 'bg-orange-500', label: 'Orders' },
              { color: 'bg-purple-500', label: 'Deliveries' },
              { color: 'bg-red-500', label: 'Leads' },
              { color: 'bg-amber-500', label: 'Enquiries' },
              { color: 'bg-cyan-500', label: 'Quotations' },
              { color: 'bg-indigo-500', label: 'Invoices' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items Column */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Day Protocol</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{format(selectedDate, 'EEEE, MMM do')}</p>
             </div>
             <Button variant="outline" className="h-8 w-8 p-0 rounded-lg">
                <Plus size={14} />
             </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {selectedDateItems.length > 0 ? (
                selectedDateItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={`p-5 transition-all ${item.status === 'completed' ? 'bg-stone-50/50 border-stone-100' : 'hover:border-accent-sage/30'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className={`p-2.5 rounded-xl ${
                          item.type === TrackerType.PAYMENT ? 'bg-emerald-50 text-emerald-600' :
                          item.type === TrackerType.APPOINTMENT ? 'bg-blue-50 text-blue-600' :
                          item.type === TrackerType.ORDER ? 'bg-orange-50 text-orange-600' :
                          item.type === TrackerType.DELIVERY ? 'bg-purple-50 text-purple-600' :
                          item.type === TrackerType.LEAD ? 'bg-red-50 text-red-600' :
                          item.type === TrackerType.ENQUIRY ? 'bg-amber-50 text-amber-600' :
                          item.type === TrackerType.QUOTATION ? 'bg-cyan-50 text-cyan-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {item.type === TrackerType.PAYMENT && <DollarSign size={18} />}
                          {item.type === TrackerType.APPOINTMENT && <CalendarIcon size={18} />}
                          {item.type === TrackerType.ORDER && <Package size={18} />}
                          {item.type === TrackerType.DELIVERY && <Truck size={18} />}
                          {item.type === TrackerType.LEAD && <Target size={18} />}
                          {item.type === TrackerType.ENQUIRY && <HelpCircle size={18} />}
                          {item.type === TrackerType.QUOTATION && <FileText size={18} />}
                          {item.type === TrackerType.INVOICE && <Receipt size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-black tracking-tight ${item.status === 'completed' ? 'text-stone-400 line-through' : 'text-text-main'}`}>
                            {item.title}
                          </h4>
                          <p className="text-xs text-text-muted leading-relaxed mt-1">{item.description}</p>
                          
                          <div className="flex items-center gap-4 mt-4">
                            {item.time && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                <Clock size={12} />
                                {item.time}
                              </div>
                            )}
                            {item.amount && (
                              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                ₹{item.amount.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {item.comments && (
                            <div className="mt-3 p-3 bg-stone-100 rounded-lg border-l-2 border-accent-sage">
                              <p className="text-[10px] font-bold text-text-muted italic flex items-center gap-2">
                                <MessageSquare size={10} /> {item.comments}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleOpenReschedule(item)}
                              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                              <CalendarClock size={14} />
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                         <Badge variant={item.status === 'completed' ? 'accent' : 'outline'} className="text-[8px]">
                            {item.status.toUpperCase()}
                         </Badge>
                         
                         {item.status === 'pending' && (
                           <Button 
                            variant="primary" 
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            onClick={() => handleMarkComplete(item)}
                           >
                            Complete
                           </Button>
                         )}
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 px-6 text-center bg-stone-50 rounded-2xl md:rounded-[2rem] border border-dashed border-stone-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100 shadow-sm">
                    <CheckCircle2 className="text-stone-200" size={32} />
                  </div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em]">Zero Protocols</h4>
                  <p className="text-[10px] text-stone-300 font-bold uppercase mt-1">No action items for this temporal coordinate</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommentModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-text-main uppercase tracking-tight">Finalize Action</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">{activeItem?.title}</p>
                </div>
                <button onClick={() => setIsCommentModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Resolution Comments</label>
                  <textarea 
                    className="w-full min-h-[120px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none"
                    placeholder="Enter completion notes or verification IDs..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setIsCommentModalOpen(false)}>
                    Dismiss
                  </Button>
                  <Button variant="primary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl" onClick={submitCompletion}>
                    Confirm Protocol
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRescheduleModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-text-main uppercase tracking-tight">Reschedule Protocol</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Move item to different coordinate</p>
                </div>
                <button onClick={() => setIsRescheduleModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">New Target Date</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all font-bold"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Reason for Rescheduling</label>
                  <textarea 
                    className="w-full min-h-[100px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none"
                    placeholder="Enter reason for delay or shift..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setIsRescheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl" onClick={submitReschedule}>
                    Relocate Item
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-text-main uppercase tracking-tight">Edit Action Details</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Modify tracker metadata</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Title</label>
                    <input 
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all font-bold"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Description</label>
                    <textarea 
                      className="w-full min-h-[80px] p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all resize-none"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Time</label>
                      <input 
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all"
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Amount (if applicable)</label>
                      <input 
                        type="number"
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-accent-sage/20 focus:border-accent-sage outline-none transition-all"
                        value={editForm.amount || ''}
                        onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1 h-12 uppercase tracking-widest text-[10px] font-black shadow-xl" onClick={submitEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
