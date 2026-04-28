import React from 'react';
import { Card, Badge } from '../components/UI';
import { SAMPLE_PRODUCTS } from '../constants';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

export const Inventory: React.FC = () => {
  // Mock inventory data linked to products
  const inventoryItems = SAMPLE_PRODUCTS.map(p => ({
    ...p,
    stockLevel: Math.floor(Math.random() * 100),
    reorderLevel: 20,
    status: Math.random() > 0.8 ? 'Low Stock' : 'In Stock'
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-[var(--theme-card-bg,white)] border border-border-base rounded-[2rem] p-6 md:p-8 shadow-sm flex items-center gap-6 transition-colors">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-accent-sage/10 text-accent-sage rounded-2xl flex items-center justify-center shrink-0">
            <Package size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Items</p>
            <p className="text-3xl md:text-4xl font-black tracking-tighter text-text-main uppercase">{inventoryItems.length}</p>
          </div>
        </div>
        <div className="bg-[var(--theme-card-bg,white)] border border-border-base rounded-[2rem] p-6 md:p-8 shadow-sm flex items-center gap-6 transition-colors">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-status-overdue-bg text-status-overdue-text rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Low Stock</p>
            <p className="text-3xl md:text-4xl font-black tracking-tighter text-text-main uppercase">{inventoryItems.filter(i => i.stockLevel < i.reorderLevel).length}</p>
          </div>
        </div>
        <div className="bg-text-main dark:bg-zinc-900 border border-text-main dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-sm flex items-center gap-6 text-white transition-colors col-span-full sm:col-span-1 lg:col-span-1">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Total Valuation</p>
            <p className="text-2xl md:text-3xl font-black tracking-tighter">
              ₹{inventoryItems.reduce((acc, current) => acc + (current.stockLevel * current.unitPrice), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Warehouse Storage" subtitle="Material tracking & environmental controls">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-base">
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Product Node</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Batch ID</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base">
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-bg-main transition-colors text-[13px]">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-text-main uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-text-muted font-bold opacity-60">SKU: {item.sku}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center text-text-muted font-mono text-[10px]">B-{Math.floor(Math.random() * 1000)}</td>
                      <td className="px-4 py-3.5 text-center font-black text-text-main">{item.stockLevel}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge color={item.stockLevel < item.reorderLevel ? 'red' : 'green'}>
                          {item.stockLevel < item.reorderLevel ? 'Alert' : 'Stable'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Inbound Traffic" subtitle="Scheduled supplier drops">
             <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="p-4 rounded-2xl bg-bg-main border border-border-base transition-all hover:border-accent-sage/30">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-xs font-black text-text-main uppercase tracking-tight">GCC Biotech</p>
                       <Badge color="blue">Tomorrow</Badge>
                    </div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">32 Line Items • ₹45,200</p>
                  </div>
                ))}
             </div>
          </Card>

          <Card title="Zone Health" subtitle="Environmental monitoring">
             <div className="space-y-4 text-center py-4">
                <div className="flex justify-around items-center">
                   <div>
                      <p className="text-2xl font-black text-text-main">24°C</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Temp</p>
                   </div>
                   <div className="w-[1px] h-8 bg-border-base"></div>
                   <div>
                      <p className="text-2xl font-black text-text-main">45%</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Humidity</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
