import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';

export const Orders: React.FC = () => {
  const orders = [
    { id: 'ORD-2024-001', customer: 'City Hospital', date: '2024-03-25', amount: 15400.00, status: 'Processing' },
    { id: 'ORD-2024-002', customer: 'General Clinic', date: '2024-03-24', amount: 3200.50, status: 'Shipped' },
    { id: 'ORD-2024-003', customer: 'Lab Solutions', date: '2024-03-23', amount: 890.00, status: 'Delivered' },
    { id: 'ORD-2024-004', customer: 'St. Mary’s Center', date: '2024-03-22', amount: 45600.00, status: 'Pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'green';
      case 'Shipped': return 'blue';
      case 'Processing': return 'yellow';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-sage text-white rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-main">Order Management</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export</Button>
          <Button variant="primary" size="sm">+ New Order</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-base">
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-text-muted uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-bg-main transition-colors text-[13px]">
                  <td className="px-6 py-4 font-bold text-accent-sage">{order.id}</td>
                  <td className="px-6 py-4 font-medium text-text-main">{order.customer}</td>
                  <td className="px-6 py-4 text-text-muted">{order.date}</td>
                  <td className="px-6 py-4 font-semibold text-text-main">₹{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card title="Activity Feed" subtitle="Recent warehouse updates" className="flex-1">
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 relative">
                {i < 3 && <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-border-base"></div>}
                <div className="w-6 h-6 rounded-full bg-accent-sage/10 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent-sage"></div>
                </div>
                <div className="space-y-1">
                   <p className="text-sm text-text-main font-medium">Order #ORD-2024-00{i} packed by Warehouse B</p>
                   <p className="text-xs text-text-muted">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Delivery Performance" subtitle="fulfillment success rate" className="flex-1">
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-flex mb-2">
                <svg className="w-24 h-24">
                  <circle className="text-border-base" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                  <circle className="text-accent-sage" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={25.12} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-main">90%</span>
              </div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-widest">On-time Delivery</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
