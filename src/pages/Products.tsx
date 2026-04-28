import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { Product, ProductStatus } from '../types';
import { Edit2, Trash2, Search, Plus, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductsPageProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ products, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProductStatus>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    taxPercentage: 0,
    status: ProductStatus.ACTIVE
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', category: '', unitPrice: 0, taxPercentage: 0, status: ProductStatus.ACTIVE });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onEdit({ ...formData, id: editingProduct.id });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by name or SKU..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400 font-semibold" size={18} />
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-40 h-10 py-0"
            >
              <option value="All">All Status</option>
              <option value={ProductStatus.ACTIVE}>Active</option>
              <option value={ProductStatus.INACTIVE}>Inactive</option>
            </Select>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600 text-sm">Product Name</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">SKU</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Category</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Unit Price</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Tax %</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="py-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="py-4 text-slate-600">{p.category}</td>
                  <td className="py-4 font-semibold text-slate-900">₹{p.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-slate-600">{p.taxPercentage}%</td>
                  <td className="py-4">
                    <Badge color={p.status === ProductStatus.ACTIVE ? 'green' : 'red'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleOpenEdit(p)} className="h-8 w-8 text-blue-600 border-blue-100 hover:bg-blue-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => onDelete(p.id)} className="h-8 w-8 text-red-600 border-red-100 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">No products found matching your search</td>
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
              <Card title={editingProduct ? "Edit Product" : "Add New Product"}>
                <div className="absolute top-4 right-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input 
                        label="Product Name" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <Input 
                      label="SKU / Code" 
                      required 
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                    />
                    <Input 
                      label="Category" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                    <Input 
                      label="Unit Price" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={formData.unitPrice} 
                      onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                    />
                    <Input 
                      label="Tax Percentage (%)" 
                      type="number" 
                      required 
                      value={formData.taxPercentage} 
                      onChange={e => setFormData({...formData, taxPercentage: parseFloat(e.target.value) || 0})}
                    />
                    <Select 
                      label="Status" 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as ProductStatus})}
                    >
                      <option value={ProductStatus.ACTIVE}>Active</option>
                      <option value={ProductStatus.INACTIVE}>Inactive</option>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button className="flex-1" type="submit">Save Product</Button>
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

