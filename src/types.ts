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
  DRAFT = 'Draft',
  NEW_LEAD = 'New Lead', // Created today
  LEAD = 'Lead', // Older than 1 day
  APPOINTMENT_SCHEDULED = 'Appointment Scheduled',
  MEETING_COMPLETED = 'Meeting Happened',
  SAMPLES_SENT = 'Samples Sent',
  ENQUIRY_RECEIVED = 'Requirements Received',
  QUOTATION_SHARED = 'Quotation Shared',
  NEGOTIATION = 'Negotiation Required',
  QUOTATION_APPROVED = 'Quotation Approved',
  ON_HOLD = 'On Hold',
  INVALID_LEAD = 'Invalid Lead',
  PO_RECEIVED = 'PO Received',
  CONVERTED = 'Converted',
  LOST = 'Lost',
  REJECTED = 'Rejected',
  RESCHEDULED = 'Meeting Rescheduled',
}

export enum LeadType {
  DIRECT_WALKIN = 'Direct Walk-In',
  REFERRAL = 'Referral',
  FRIEND = 'Friend',
  INTERNET = 'sourced from Internet',
  OLD_LEAD = 'old lead',
}

export enum DispatchStatus {
  PENDING = 'Pending',
  DISPATCHED = 'Dispatched',
  DELIVERED = 'Delivered',
  LOST = 'Lost/Issue',
  REDIRECTED = 'Redirected',
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
  contactPerson?: string; // Lead Name (Optional)
  designation?: string; // Designation of Person (Optional)
  leadSource?: string; // Lead Source (Optional)
  leadType?: LeadType; // Lead Type (Optional)
  referredBy?: string; // Conditional field
  email?: string;
  phone?: string;
  requirements?: string;
  status: CRMStatus;
  meetingDate?: string;
  meetingType?: 'In Person' | 'Phone Call' | 'Online';
  meetingVenue?: 'Client Site' | 'Public Location' | 'Our Office';
  meetingOutcome?: 'Samples Required' | 'Shared Requirements' | 'On Hold' | 'Another Meeting Required';
  onHoldReason?: string;
  followUpRequired?: boolean;
  notes?: string;
  meetingNotes?: string;
  assignedTo?: string;
  appointmentDate?: string; // Appointment Date & Time
  appointmentTime?: string;
  quotationVersions?: QuotationVersion[];
  enquiryVersions?: EnquiryVersion[];
  sampleProductIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface EnquiryVersion {
  id: string;
  version: number;
  details: string;
  date: string;
}

export interface QuotationVersion {
  id: string;
  version: number;
  items: InvoiceItem[];
  totalAmount: number;
  date: string;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
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
  advanceAmount?: number;
  advancePaid?: number;
  status: 'Pending' | 'On Hold' | 'Converted' | 'Cancelled';
  documentUrl?: string;
  createdAt: any;
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
  poNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  advanceAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  dispatchStatus?: DispatchStatus;
  trackingNumber?: string;
  courierPartner?: string;
  deliveryProofUrl?: string;
  logisticsNotes?: string;
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
