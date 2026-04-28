export enum PaymentStatus {
  DRAFT = 'Draft',
  UNPAID = 'Unpaid',
  PARTIALLY_PAID = 'Partially Paid',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export enum ProductStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  taxPercentage: number;
  status: ProductStatus;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  mobile: string;
  email: string;
  billingAddress: string;
  taxNumber: string;
  status: 'Active' | 'Inactive';
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  billingAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface PaymentEntry {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  referenceNumber?: string;
  remarks?: string;
}
