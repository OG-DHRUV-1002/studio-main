
import { z } from 'zod';

export const PatientSchema = z.object({
  patientId: z.string(),
  title: z.string().optional(),
  fullName: z.string(),
  dateOfBirth: z.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  email: z.string().optional(),
  contactNumber: z.string(),
  address: z.string().optional(),
  remarks: z.string().optional(),
  registeredBy: z.string().optional(),
  createdAt: z.date(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const UpdatablePatientSchema = PatientSchema.omit({ createdAt: true, patientId: true }).extend({
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
});


export const TestResultSchema = z.object({
  testName: z.string(),
  testPrice: z.number(),
  resultValue: z.string().optional(),
  normalRange: z.string().optional(),
  technicianNotes: z.string().optional(),
});
export type TestResult = z.infer<typeof TestResultSchema>;


export const TestOrderSchema = z.object({
  orderId: z.string(),
  patientId: z.string(),
  patient: PatientSchema.optional(),
  orderDate: z.date(),
  status: z.enum(['Pending', 'Payment Pending', 'Completed']),
  totalAmount: z.number(),
  discountApplied: z.number(),
  finalAmount: z.number(),
  labType: z.enum(['in-house', 'outside']),
  tests: z.array(TestResultSchema),
  referredBy: z.string().optional(),
  specimen: z.string().optional(),
});
export type TestOrder = z.infer<typeof TestOrderSchema>;

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface InvoiceItem {
  test_name: string;
  price: number;
  discount?: number;
  hsn_code?: string;
}

export interface Transaction {
  invoice_id: string;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  mobile?: string;
  ref_doctor?: string;
  ref_id?: string;
  lab_id: string;
  amount: number;
  payment_mode: 'CASH' | 'online';
  status: TransactionStatus;
  timestamp: string;
  items: InvoiceItem[];
  qr_string?: string;
  payment_link?: string;
}
