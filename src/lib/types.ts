
import { z } from 'zod';

export const PatientSchema = z.object({
  patientId: z.string(),
  fullName: z.string(),
  dateOfBirth: z.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string(),
  createdAt: z.date(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const UpdatablePatientSchema = PatientSchema.omit({ createdAt: true, patientId: true }).extend({
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format."}),
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
  status: z.enum(['Pending', 'Completed']),
  totalAmount: z.number(),
  discountApplied: z.number(),
  finalAmount: z.number(),
  labType: z.enum(['in-house', 'outside']),
  tests: z.array(TestResultSchema),
  referredBy: z.string().optional(),
  specimen: z.string().optional(),
});
export type TestOrder = z.infer<typeof TestOrderSchema>;
