import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { Mail, Phone, MapPin, Truck } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const suppliers = [
    { id: 'S1', name: 'GCC Biotech (India) Pvt. Ltd.', contact: 'info@gccbiotech.co.in', phone: '+91 9073682428', address: 'Kolkata, WB, India', category: 'Molecular Biology' },
    { id: 'S2', name: 'CoSara Diagnostics Pvt. Ltd.', contact: 'cpatel@cosara.in', phone: '+91 9898047209', address: 'Ahmedabad, Gujarat, India', category: 'Diagnostics' },
    { id: 'S3', name: 'Tarsons Products Limited', contact: 'info@tarsons.com', phone: '+91 033 3522 0300', address: 'Kolkata, WB, India', category: 'Consumables' },
    { id: 'S4', name: 'Hemant Surgical Industries Ltd', contact: 'info@hemantsurgical.com', phone: '+91 9619484952', address: 'Mumbai, Maharashtra, India', category: 'Equipment' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-text-main">Suppliers Directory</h2>
          <p className="text-sm text-text-muted">Manage your procurement partners</p>
        </div>
        <Button variant="primary" size="sm">+ Add Supplier</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(supplier => (
          <Card key={supplier.id} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck size={64} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-text-main text-lg">{supplier.name}</h3>
                <Badge color="indigo">{supplier.category}</Badge>
              </div>
              
              <div className="space-y-2 text-[13px] text-text-muted">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-accent-sage" />
                  <span>{supplier.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-accent-sage" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-accent-sage" />
                  <span>{supplier.address}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" size="sm" className="flex-1">View Catalogue</Button>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
