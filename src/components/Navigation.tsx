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
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-white font-bold text-xl tracking-tight">Kite<span className="text-stone-400">Invoicing</span></h1>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest mt-1">Business Portal v1.0</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/40 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
              activeTab === item.id
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/5 text-[#D6D3CE] hover:text-white'
            }`}
          >
            <item.icon size={20} className={`${activeTab === item.id ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-nowrap text-[13px]"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-stone-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-500 flex items-center justify-center text-[10px] text-white shrink-0">
            AU
          </div>
          {!isCollapsed && (
            <div className="text-[12px] overflow-hidden">
              <p className="text-white font-medium truncate">Admin User</p>
              <p className="text-stone-500 truncate">Admin</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const TopBar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-border-base sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-sm italic capitalize">Invoicing / {title} Overview</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search records..." 
            className="pl-8 pr-4 py-1.5 bg-stone-100 border-none rounded-md text-sm focus:ring-1 focus:ring-stone-300 w-64 outline-none text-text-main"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
        </div>
        <button className="bg-accent-sage text-white px-4 py-1.5 text-sm font-medium rounded-md hover:bg-accent-sage-hover transition-colors">
          + Create Invoice
        </button>
      </div>
    </header>
  );
};
