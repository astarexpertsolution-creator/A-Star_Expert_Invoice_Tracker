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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-border-base rounded-[2rem] p-8 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-accent-sage/10 text-accent-sage rounded-2xl flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Items</p>
            <p className="text-4xl font-black tracking-tighter">{inventoryItems.length}</p>
          </div>
        </div>
        <div className="bg-white border border-border-base rounded-[2rem] p-8 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-status-overdue-bg text-status-overdue-text rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Low Stock</p>
            <p className="text-4xl font-black tracking-tighter">{inventoryItems.filter(i => i.stockLevel < i.reorderLevel).length}</p>
          </div>
        </div>
        <div className="bg-text-main border border-text-main rounded-[2rem] p-8 shadow-xl shadow-stone-200 flex items-center gap-6 text-white">
          <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">Total Valuation</p>
            <p className="text-3xl font-black tracking-tighter">
              ₹{inventoryItems.reduce((acc, current) => acc + (current.stockLevel * current.unitPrice), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Card title="Stock Inventory" subtitle="Current warehouse levels and reorder status">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-base">
                <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">SKU</th>
                <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Stock</th>
                <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Reorder</th>
                <th className="px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-bg-main transition-colors text-[13px]">
                  <td className="px-4 py-3.5 font-medium text-text-main">{item.name}</td>
                  <td className="px-4 py-3.5 text-center text-text-muted font-mono text-xs">{item.sku}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-text-main">{item.stockLevel}</td>
                  <td className="px-4 py-3.5 text-center text-text-muted">{item.reorderLevel}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Badge color={item.stockLevel < item.reorderLevel ? 'red' : 'green'}>
                      {item.stockLevel < item.reorderLevel ? 'Low Stock' : 'Available'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
