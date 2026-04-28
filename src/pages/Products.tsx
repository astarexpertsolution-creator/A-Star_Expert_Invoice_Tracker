import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { Product, ProductStatus } from '../types';
import { Edit2, Trash2, Search, Plus, Filter, X, Boxes, ChevronRight } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    category: '',
    supplierId: '',
    mrp: 0,
    baseMargin: 10,
    unitPrice: 0,
    taxPercentage: 0,
    specifications: '',
    status: ProductStatus.ACTIVE
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
    activeCount: products.filter(p => p.category === cat && p.status === ProductStatus.ACTIVE).length
  }));

  const sortedCategories = [...categoryStats].sort((a, b) => {
    if (selectedCategory === a.name) return -1;
    if (selectedCategory === b.name) return 1;
    return 0;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      sku: '', 
      category: '', 
      supplierId: '',
      mrp: 0,
      baseMargin: 10,
      unitPrice: 0, 
      taxPercentage: 0, 
      specifications: '',
      status: ProductStatus.ACTIVE 
    });
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-[var(--theme-card-bg,white)] p-4 md:p-6 rounded-3xl shadow-sm border border-border-base transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          {selectedCategory && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              className="gap-2 h-12 rounded-xl w-full sm:w-auto"
            >
              <X size={16} /> Back
            </Button>
          )}
          <div className="relative flex-1 max-w-none sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <Input 
              placeholder="Search enterprise catalog..." 
              className="pl-12 h-12" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-bg-main rounded-xl flex items-center justify-center text-text-muted hidden sm:flex">
                <Filter size={18} />
             </div>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-44 h-12 py-0 rounded-xl"
            >
              <option value="All">All Status Types</option>
              <option value={ProductStatus.ACTIVE}>Active Units</option>
              <option value={ProductStatus.INACTIVE}>Inactive Units</option>
            </Select>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 h-12 px-6 sm:px-8 w-full lg:w-auto">
          <Plus size={18} /> New Product
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {sortedCategories.map((cat) => {
            const isExpanded = selectedCategory === cat.name;
            return (
              <motion.div
                key={cat.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300, layout: { duration: 0.4 } }}
                onClick={() => !isExpanded && setSelectedCategory(cat.name)}
                className={`group cursor-pointer ${isExpanded ? 'col-span-full' : ''}`}
              >
                <Card className={`transition-all border-2 rounded-[2.5rem] overflow-hidden ${isExpanded ? 'border-accent-sage ring-8 ring-accent-sage/5' : 'border-transparent hover:border-accent-sage/20 shadow-sm hover:shadow-xl'}`}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isExpanded ? 'bg-accent-sage text-white' : 'bg-accent-sage/5 text-accent-sage group-hover:scale-110'}`}>
                         <Boxes size={28} />
                      </div>
                      <div className="flex items-center gap-3">
                        {isExpanded && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(null); }}
                            className="text-accent-sage hover:bg-accent-sage/10 rounded-xl"
                          >
                            Collapse Catalog <X size={14} className="ml-2" />
                          </Button>
                        )}
                        <Badge color={isExpanded ? 'green' : 'indigo'} className="px-3 py-1 scale-110">
                          {cat.count} Units
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`font-black tracking-tight transition-all ${isExpanded ? 'text-4xl text-accent-sage' : 'text-2xl text-text-main group-hover:text-accent-sage'}`}>
                        {cat.name}
                      </h3>
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.1em] mt-2 inline-flex items-center gap-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${isExpanded ? 'bg-accent-sage animate-pulse' : 'bg-emerald-500'}`}></span>
                         {cat.activeCount} Active Units Ready for Dispatch
                      </p>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-8 border-t border-border-base mt-8 overflow-hidden"
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                            <table className="w-full text-left min-w-[700px]">
                              <thead>
                                <tr className="border-b border-border-base">
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product Node</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Identification</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">M.R.P</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Margin %</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Price</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Tax %</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                  <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-base/50">
                                {filteredProducts.map((p) => (
                                  <tr key={p.id} className="group/row hover:bg-bg-main transition-colors">
                                    <td className="py-5">
                                      <p className="font-bold text-text-main tracking-tight">{p.name}</p>
                                    </td>
                                    <td className="py-5 font-mono text-[10px] text-stone-400 font-bold">{p.sku}</td>
                                    <td className="py-5 text-right font-black text-text-main tracking-tighter opacity-40">₹{p.mrp?.toFixed(2)}</td>
                                    <td className="py-5 text-right font-black text-accent-sage tracking-tighter">{p.baseMargin}%</td>
                                    <td className="py-5 text-right font-black text-text-main tracking-tighter">₹{p.unitPrice.toFixed(2)}</td>
                                    <td className="py-5 text-center text-text-muted font-bold text-xs">{p.taxPercentage}%</td>
                                    <td className="py-5">
                                      <Badge color={p.status === ProductStatus.ACTIVE ? 'green' : 'red'}>
                                        {p.status}
                                      </Badge>
                                    </td>
                                    <td className="py-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(p); }} 
                                          className="h-9 w-9 text-text-main border-border-base hover:bg-white"
                                        >
                                          <Edit2 size={14} />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} 
                                          className="h-9 w-9 text-red-500 border-red-100 hover:bg-red-50"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {!isExpanded && (
                    <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-accent-sage border-t border-border-base pt-6 pb-2">
                      <span>Explore Department</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
          
          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-text-muted italic">No categories found. Add a product with a category to get started.</p>
            </div>
          )}
        </div>
      </AnimatePresence>

      {/* Global Search Results (if searching and no specific category expanded or searching across all) */}
      {searchTerm !== '' && !selectedCategory && (
        <Card title="Global Search Results" subtitle={`Found ${filteredProducts.length} items matching "${searchTerm}"`}>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-base">
                    <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product</th>
                    <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Category</th>
                    <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Price</th>
                    <th className="pb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base/50">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-main transition-colors">
                      <td className="py-4">
                        <p className="font-bold text-text-main text-sm">{p.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{p.sku}</p>
                      </td>
                      <td className="py-4">
                        <Badge color="slate">{p.category}</Badge>
                      </td>
                      <td className="py-4 font-black text-text-main">₹{p.unitPrice.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </Card>
      )}

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
                    <Select 
                      label="Supplier" 
                      value={formData.supplierId} 
                      onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    >
                      <option value="">Select Supplier</option>
                      <option value="S1">GCC Biotech</option>
                      <option value="S2">CoSara Diagnostics</option>
                      <option value="S3">Tarsons</option>
                    </Select>
                    <Input 
                      label="M.R.P" 
                      type="number" 
                      value={formData.mrp} 
                      onChange={e => {
                        const mrp = parseFloat(e.target.value) || 0;
                        const unitPrice = mrp - (mrp * (formData.baseMargin || 0) / 100);
                        setFormData({...formData, mrp, unitPrice});
                      }}
                    />
                    <Input 
                      label="Base Margin (%)" 
                      type="number" 
                      value={formData.baseMargin} 
                      onChange={e => {
                        const baseMargin = parseFloat(e.target.value) || 0;
                        const unitPrice = (formData.mrp || 0) - ((formData.mrp || 0) * baseMargin / 100);
                        setFormData({...formData, baseMargin, unitPrice});
                      }}
                    />
                    <div className="flex flex-col justify-end pb-2">
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Calculated Price</p>
                       <p className="text-xl font-black text-accent-sage tracking-tighter">₹{formData.unitPrice.toFixed(2)}</p>
                    </div>
                    <Input 
                      label="Tax (%)" 
                      type="number" 
                      value={formData.taxPercentage} 
                      onChange={e => setFormData({...formData, taxPercentage: parseFloat(e.target.value) || 0})}
                    />
                    <div className="col-span-2">
                       <Input 
                        label="Specifications" 
                        value={formData.specifications} 
                        onChange={e => setFormData({...formData, specifications: e.target.value})}
                      />
                    </div>
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

