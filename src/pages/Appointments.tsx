import React, { useState } from 'react';
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
  X
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
  DELIVERY = 'delivery'
}

interface ActionItem {
  id: string;
  type: TrackerType;
  title: string;
  description: string;
  time?: string;
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
    { id: '5', type: TrackerType.PAYMENT, title: 'Tarsons Monthly Clearance', description: 'Consumables payment due', amount: 45000, status: 'completed', comments: 'Cleared via NEFT' },
  ];

  // Distribute items across the month
  for (let i = 0; i < 15; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    const dateKey = format(new Date(now.getFullYear(), now.getMonth(), day), 'yyyy-MM-dd');
    if (!data[dateKey]) data[dateKey] = [];
    data[dateKey].push({ ...items[Math.floor(Math.random() * items.length)], id: Math.random().toString(36).substr(2, 9) });
  }

  return data;
};

export const AppointmentsPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allData, setAllData] = useState<Record<string, ActionItem[]>>(generateMockData());
  const [filter, setFilter] = useState<TrackerType | 'all'>('all');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ActionItem | null>(null);
  const [comment, setComment] = useState('');

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

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            onClick={() => setFilter('all')}
          >
            All Items
          </Button>
          {[
            { id: TrackerType.PAYMENT, label: 'Payments', color: 'bg-emerald-500' },
            { id: TrackerType.ORDER, label: 'Orders', color: 'bg-orange-500' },
            { id: TrackerType.DELIVERY, label: 'Deliveries', color: 'bg-purple-500' },
            { id: TrackerType.APPOINTMENT, label: 'Appointments', color: 'bg-blue-500' },
          ].map((cat) => (
            <Button 
              key={cat.id}
              variant={filter === cat.id ? 'primary' : 'outline'} 
              className={`h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all gap-2`}
              onClick={() => setFilter(cat.id)}
            >
              <div className={`w-2 h-2 rounded-full ${cat.color}`} />
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
                    'bg-purple-500'
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

  // Calculate Monthly Summary
  const monthlyItems = (Object.entries(allData) as [string, ActionItem[]][]).reduce((acc: ActionItem[], [dateKey, items]) => {
    const date = new Date(dateKey);
    if (isSameMonth(date, currentMonth)) {
      acc.push(...items);
    }
    return acc;
  }, []);

  const openItems = monthlyItems.filter(item => item.status === 'pending');
  const summaryByStatus = {
    [TrackerType.PAYMENT]: openItems.filter(it => it.type === TrackerType.PAYMENT).length,
    [TrackerType.ORDER]: openItems.filter(it => it.type === TrackerType.ORDER).length,
    [TrackerType.DELIVERY]: openItems.filter(it => it.type === TrackerType.DELIVERY).length,
    [TrackerType.APPOINTMENT]: openItems.filter(it => it.type === TrackerType.APPOINTMENT).length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Calendar Column */}
        <div className="xl:col-span-8 space-y-6">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-6 px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Deliveries</span>
            </div>
          </div>
        </div>

        {/* Action Items Column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Monthly Summary Card */}
          <Card className="p-6 bg-stone-900 border-none text-white shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent-sage mb-6">Monthly Protocol Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1">Open Payments</p>
                <p className="text-xl font-black">{summaryByStatus[TrackerType.PAYMENT]}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1">Pending Orders</p>
                <p className="text-xl font-black">{summaryByStatus[TrackerType.ORDER]}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1">Deliveries</p>
                <p className="text-xl font-black">{summaryByStatus[TrackerType.DELIVERY]}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1">Appointments</p>
                <p className="text-xl font-black">{summaryByStatus[TrackerType.APPOINTMENT]}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Total Active Invariants</p>
                <p className="text-2xl font-black text-accent-sage">{openItems.length}</p>
              </div>
              <CheckCircle2 className="text-white/20" size={32} />
            </div>
          </Card>

          <div className="flex items-center justify-between mt-8 mb-4">
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
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {item.type === TrackerType.PAYMENT && <DollarSign size={18} />}
                          {item.type === TrackerType.APPOINTMENT && <CalendarIcon size={18} />}
                          {item.type === TrackerType.ORDER && <Package size={18} />}
                          {item.type === TrackerType.DELIVERY && <Truck size={18} />}
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
                          <button className="text-stone-300 hover:text-stone-500">
                            <MoreVertical size={16} />
                          </button>
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
                <div className="py-12 px-6 text-center bg-stone-50 rounded-[2rem] border border-dashed border-stone-300">
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
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
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
    </div>
  );
};
