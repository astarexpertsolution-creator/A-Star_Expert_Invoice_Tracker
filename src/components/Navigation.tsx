import React from 'react';
import { LayoutDashboard, Package, Users, FileText, CreditCard, ChevronLeft, ChevronRight, Menu, LogOut, Boxes, ShoppingCart, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '220px' }}
      className="h-screen bg-sidebar-bg text-[#D6D3CE] flex flex-col sticky top-0"
    >
      <div className="p-6 flex flex-col mb-4">
        <div className="flex items-center justify-between mb-1">
          <AnimatePresence mode="wait">
            <motion.div
              initial={false}
              animate={{ 
                width: isCollapsed ? '32px' : 'auto',
                height: isCollapsed ? '32px' : 'auto'
              }}
              className="flex items-center justify-center overflow-hidden"
            >
              <img 
                src="/logo.png" 
                alt="A-Star Logo" 
                className={`${isCollapsed ? 'w-8 h-8' : 'w-32'} h-auto object-contain`} 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src='https://placehold.co/128x128/1A1A1A/white?text=A*';
                }} 
              />
            </motion.div>
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              activeTab === item.id
                ? 'bg-accent-sage text-white shadow-lg shadow-accent-sage/20'
                : 'hover:bg-white/5 text-stone-400 hover:text-white'
            }`}
          >
            <item.icon size={18} className={`${activeTab === item.id ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold whitespace-nowrap text-[12px] uppercase tracking-widest"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-sage to-accent-sage-hover flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg">
            AU
          </div>
          {!isCollapsed && (
            <div className="text-[12px] overflow-hidden">
              <p className="text-white font-black truncate tracking-tight uppercase">Admin User</p>
              <p className="text-stone-500 truncate font-bold text-[10px] uppercase">Corporate Admin</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const TopBar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-20 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-border-base sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">A-Star Portal</span>
        <span className="text-stone-300">/</span>
        <span className="text-sm font-black text-text-main uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search enterprise records..." 
            className="pl-10 pr-6 py-2.5 bg-bg-main border border-border-base rounded-xl text-xs focus:ring-2 focus:ring-accent-sage/10 focus:border-accent-sage w-80 outline-none text-text-main transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
        </div>
        <button className="bg-text-main text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-stone-800 transition-all active:scale-[0.98] shadow-lg shadow-stone-200">
          + Create Invoice
        </button>
      </div>
    </header>
  );
};
