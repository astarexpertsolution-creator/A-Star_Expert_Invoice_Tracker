import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Customer } from '../types';
import { Edit2, Trash2, Search, Plus, Mail, Phone, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersPageProps {
  customers: Customer[];
  onAdd: (customer: Omit<Customer, 'id'>) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ customers, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    code: '',
    contactPerson: '',
    mobile: '',
    email: '',
    billingAddress: '',
    taxNumber: '',
    status: 'Active'
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', code: '', contactPerson: '', mobile: '', email: '', billingAddress: '', taxNumber: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ ...c });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onEdit({ ...formData, id: editingCustomer.id });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name, code or email..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Add Customer
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600 text-sm">Customer Info</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Contact Details</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Billing Address</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Tax ID</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-slate-500 font-mono text-xs mt-0.5">{c.code}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {c.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-start gap-1.5 text-sm text-slate-600 max-w-[200px]">
                      <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="truncate whitespace-normal line-clamp-2">{c.billingAddress}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600 text-sm">{c.taxNumber}</td>
                  <td className="py-4">
                    <Badge color={c.status === 'Active' ? 'green' : 'red'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenEdit(c)} className="h-8 w-8 text-blue-600 border-blue-100 hover:bg-blue-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => onDelete(c.id)} className="h-8 w-8 text-red-600 border-red-100 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">No customers found matching your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <Card title={editingCustomer ? "Edit Customer" : "Add New Customer"}>
                <div className="absolute top-4 right-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input 
                        label="Customer Name" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <Input 
                      label="Customer Code" 
                      required 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                    <Input 
                      label="Contact Person" 
                      value={formData.contactPerson} 
                      onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    />
                    <Input 
                      label="Email" 
                      type="email"
                      required 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <Input 
                      label="Mobile Number" 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                    />
                    <div className="col-span-2">
                       <Input 
                        label="Billing Address" 
                        value={formData.billingAddress} 
                        onChange={e => setFormData({...formData, billingAddress: e.target.value})}
                      />
                    </div>
                    <Input 
                      label="GST / Tax Number" 
                      value={formData.taxNumber} 
                      onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button className="flex-1" type="submit">Save Customer</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

