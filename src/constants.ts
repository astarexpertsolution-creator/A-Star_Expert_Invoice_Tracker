import { Product, Customer, Invoice, PaymentStatus, ProductStatus } from './types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    category: 'Electronics',
    unitPrice: 25.00,
    taxPercentage: 18,
    status: ProductStatus.ACTIVE,
  },
  {
    id: 'p2',
    name: 'Mechanical Keyboard',
    sku: 'MK-002',
    category: 'Electronics',
    unitPrice: 75.00,
    taxPercentage: 18,
    status: ProductStatus.ACTIVE,
  },
  {
    id: 'p3',
    name: 'USB-C Cable 2m',
    sku: 'UC-003',
    category: 'Accessories',
    unitPrice: 12.00,
    taxPercentage: 12,
    status: ProductStatus.ACTIVE,
  },
];

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
        productId: 'p1',
        productName: 'Wireless Mouse',
        quantity: 10,
        unitPrice: 25.00,
        taxPercentage: 18,
        lineTotal: 295.00,
      }
    ],
    subtotal: 250.00,
    taxTotal: 45.00,
    grandTotal: 295.00,
    paidAmount: 295.00,
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
        productId: 'p2',
        productName: 'Mechanical Keyboard',
        quantity: 5,
        unitPrice: 75.00,
        taxPercentage: 18,
        lineTotal: 442.50,
      }
    ],
    subtotal: 375.00,
    taxTotal: 67.50,
    grandTotal: 442.50,
    paidAmount: 200.00,
    status: PaymentStatus.PARTIALLY_PAID,
    createdAt: '2024-03-20T11:00:00Z',
  }
];
