import React from 'react';
import { LayoutDashboard, Users, FileText, CreditCard, ChevronLeft, ChevronRight, Menu, Boxes, ShoppingCart, Truck, Palette, Calendar, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navSections = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'appointments', label: 'Calendar', icon: Calendar }
    ]
  },
  {
    label: 'Lead Management',
    items: [
      { id: 'leads', label: 'Leads CRM', icon: UserPlus },
    ]
  },
  {
    label: 'Order Desk',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'payments', label: 'Payments', icon: CreditCard },
    ]
  },
  {
    label: 'Enterprise Masters',
    items: [
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
      { id: 'products', label: 'Product Master', icon: Boxes },
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'customize', label: 'Brand & UI', icon: Palette },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-transparent z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? (window.innerWidth < 1024 ? '0px' : '80px') : '220px',
          x: isCollapsed && window.innerWidth < 1024 ? -220 : 0
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
        className={`fixed lg:relative inset-y-0 left-0 bg-sidebar-bg text-[#D6D3CE] flex flex-col z-[50] overflow-hidden transition-colors duration-300`}
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
                className={`${isCollapsed ? 'w-8 h-8' : 'w-32'} h-auto object-contain brightness-0 invert`} 
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

      <nav className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto no-scrollbar pb-8">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-4 text-[9px] font-black text-stone-500 uppercase tracking-[0.3em] mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setIsCollapsed(true);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    activeTab === item.id
                      ? 'bg-accent-sage text-white shadow-lg'
                      : 'hover:bg-white/5 text-stone-400 hover:text-stone-100'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === item.id ? 'var(--theme-primary)' : 'transparent',
                    boxShadow: activeTab === item.id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <item.icon size={18} className={`${activeTab === item.id ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-bold whitespace-nowrap text-[12px] uppercase tracking-widest text-left"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
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
    </motion.aside>
    </>
  );
};

export const TopBar: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
  return (
    <header className="h-16 md:h-20 px-4 md:px-10 flex items-center justify-between bg-[var(--theme-card-bg,white)] border-b border-border-base sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 lg:hidden text-text-muted hover:bg-bg-main rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">A-Star Portal</span>
          <span className="text-stone-300 dark:text-stone-700">/</span>
        </div>
        <span className="text-sm font-black text-text-main uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">{title}</span>
      </div>
      <div className="flex items-center gap-3 md:gap-8">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search enterprise records..." 
            className="pl-10 pr-6 py-2.5 bg-bg-main border border-border-base rounded-xl text-xs focus:ring-2 focus:ring-accent-sage/10 focus:border-accent-sage w-80 outline-none text-text-main transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
        </div>
      </div>
    </header>
  );
};
