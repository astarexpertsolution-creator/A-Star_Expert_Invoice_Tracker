import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Select } from '../components/UI';
import { Mail, Phone, MapPin, Truck, Boxes, Plus, Info, Globe, Loader2 } from 'lucide-react';
import { Supplier } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Suppliers: React.FC<{ 
  externalSuppliers?: Supplier[], 
  loading?: boolean, 
  isBypassMode?: boolean,
  onCreate?: (data: any) => Promise<void>
}> = ({ externalSuppliers = [], loading = false, isBypassMode, onCreate }) => {
  const suppliers = externalSuppliers;

  const handleOnboardSupplier = async () => {
    const nextCode = `SUP-${(suppliers.length + 1).toString().padStart(3, '0')}`;
    const newSupplier = {
      name: 'New Scientific Partner',
      code: nextCode,
      departments: ['General'],
      contactPerson: 'Vendor Manager',
      email: 'vendor@example.com',
      phone: '+91 000 000 0000',
      address: 'Industrial Zone, State, India',
      status: 'Active' as const,
    };

    if (onCreate) {
      await onCreate(newSupplier);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-sage animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Resolving Enterprise Master Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main uppercase tracking-tight">Enterprise Onboarding</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">Register new suppliers & map departments</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto h-10 gap-2" onClick={handleOnboardSupplier}>
          <Plus size={18} /> Onboard Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliers.map(supplier => (
          <Card key={supplier.id} className="relative overflow-hidden group border-2 border-transparent hover:border-accent-sage/30">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-black text-text-main text-xl uppercase tracking-tighter">{supplier.name}</h3>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Vendor Code: {supplier.code}</p>
                </div>
                <Badge color="green">{supplier.status}</Badge>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Assigned Departments</p>
                <div className="flex flex-wrap gap-2">
                  {supplier.departments.map(dept => (
                    <Badge key={dept} color="indigo" className="px-3 py-1 bg-bg-main border border-border-base text-[10px]">{dept}</Badge>
                  ))}
                  <button className="h-6 w-6 rounded-full border border-dashed border-border-base flex items-center justify-center text-text-muted hover:border-accent-sage hover:text-accent-sage transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-[12px] text-text-muted font-bold">
                  <div className="flex items-center gap-2"><Mail size={14} className="opacity-60" /> {supplier.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="opacity-60" /> {supplier.phone}</div>
                </div>
                <div className="space-y-2 text-[12px] text-text-muted font-bold">
                  <div className="flex items-center gap-2 text-wrap"><MapPin size={14} className="shrink-0 opacity-60" /> {supplier.address}</div>
                  <div className="flex items-center gap-2"><Globe size={14} className="opacity-60" /> Website Linked</div>
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t border-border-base">
                <Button variant="outline" size="sm" className="flex-1 h-9 space-x-2 text-[10px] font-black uppercase tracking-widest">
                  <Boxes size={14} /> <span>Manage Products</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest">
                  Vendor Data
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
