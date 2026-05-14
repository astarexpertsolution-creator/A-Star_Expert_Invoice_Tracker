import { Product, Customer, Invoice, PaymentStatus, ProductStatus } from './types';
import { MEDICAL_PRODUCTS } from './data/productData';

export const SAMPLE_PRODUCTS: Product[] = MEDICAL_PRODUCTS;

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Inc',
    code: 'CUST-001',
    contactPerson: 'John Doe',
    mobile: '9876543210',
    email: 'john@techsolutions.com',
    billingAddress: '123 Tech Park, Silicon Valley, CA',
    taxNumber: 'GSTIN123456',
    status: 'Active',
  },
  {
    id: 'c2',
    name: 'Global Retailers',
    code: 'CUST-002',
    contactPerson: 'Jane Smith',
    mobile: '8765432109',
    email: 'jane@globalretail.com',
    billingAddress: '456 Market St, New York, NY',
    taxNumber: 'GSTIN789012',
    status: 'Active',
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    invoiceDate: '2024-03-15',
    dueDate: '2024-03-30',
    customerId: 'c1',
    customerName: 'Tech Solutions Inc',
    billingAddress: '123 Tech Park, Silicon Valley, CA',
    items: [
      {
        productId: 'gcc-001',
        productName: 'GSure Plasmid Mini Kit (50 Prep)',
        quantity: 5,
        unitPrice: 4028.00,
        taxPercentage: 18,
        lineTotal: 23765.20,
      }
    ],
    subtotal: 20140.00,
    taxTotal: 3625.20,
    grandTotal: 23765.20,
    paidAmount: 23765.20,
    advanceAmount: 0,
    status: PaymentStatus.PAID,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    invoiceDate: '2024-03-20',
    dueDate: '2024-04-05',
    customerId: 'c2',
    customerName: 'Global Retailers',
    billingAddress: '456 Market St, New York, NY',
    items: [
      {
        productId: 'hsil-001',
        productName: 'Low Flux Dialyzer',
        quantity: 20,
        unitPrice: 1200.00,
        taxPercentage: 12,
        lineTotal: 26880.00,
      }
    ],
    subtotal: 24000.00,
    taxTotal: 2880.00,
    grandTotal: 26880.00,
    paidAmount: 10000.00,
    advanceAmount: 0,
    status: PaymentStatus.PARTIALLY_PAID,
    createdAt: '2024-03-20T11:00:00Z',
  }
];

export const SAMPLE_LEADS: Lead[] = [
  {
    id: 'l1',
    companyName: 'Biotronix Lab',
    contactPerson: 'Dr. Anita Desai',
    phoneNumber: '9123456780',
    email: 'anita@biotronix.com',
    status: 'Interested',
    createdAt: '2024-05-10T10:00:00Z',
    notes: 'Interested in GSure Plasmid Kits'
  },
  {
    id: 'l2',
    companyName: 'Medicity Hospital',
    contactPerson: 'Rajesh Kumar',
    phoneNumber: '9234567891',
    email: 'purchase@medicity.com',
    status: 'Follow-up',
    createdAt: '2024-05-12T14:30:00Z',
    notes: 'Requires bulk quote for Dialyzers'
  }
];

export const SAMPLE_TRACKER: any[] = [
  {
    id: 't1',
    type: 'Lead',
    title: 'Biotronix follow-up',
    status: 'High',
    createdAt: '2024-05-14T08:00:00Z'
  },
  {
    id: 't2',
    type: 'Order',
    title: 'Global Retailers dispatch',
    status: 'Medium',
    createdAt: '2024-05-14T10:00:00Z'
  }
];
