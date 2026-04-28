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

export enum CRMStatus {
  LEAD = 'Lead',
  APPOINTMENT = 'Appointment',
  ONBOARDED = 'Onboarded',
}

export enum DispatchStatus {
  PENDING = 'Pending',
  DISPATCHED = 'Dispatched',
  DELIVERED = 'Delivered',
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  departments: string[];
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplierId?: string;
  mrp?: number;
  baseMargin?: number; // Default percentage
  unitPrice: number; // Calculated price for customers
  taxPercentage: number;
  specifications?: string;
  status: ProductStatus;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  requirements: string;
  status: CRMStatus;
  notes: string;
  assignedTo?: string;
  appointmentDate?: string;
  createdAt: string;
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
  leadId?: string; // Reference to original lead
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  customerId: string;
  customerName: string;
  poDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'Pending' | 'Converted' | 'Cancelled';
  documentUrl?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  mrp?: number;
  actualMargin?: number; // Percentage
  unitPrice: number; // Price after margin
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
  poId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  status: PaymentStatus;
  dispatchStatus?: DispatchStatus;
  trackingNumber?: string;
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
