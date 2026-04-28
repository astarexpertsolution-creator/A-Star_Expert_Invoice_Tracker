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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-accent-sage/10 text-accent-sage rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold">{inventoryItems.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-status-overdue-bg text-status-overdue-text rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold">{inventoryItems.filter(i => i.stockLevel < i.reorderLevel).length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Valuation</p>
            <p className="text-2xl font-bold">
              ₹{inventoryItems.reduce((acc, current) => acc + (current.stockLevel * current.unitPrice), 0).toLocaleString()}
            </p>
          </div>
        </Card>
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
