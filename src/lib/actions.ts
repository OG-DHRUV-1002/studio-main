'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import * as db from './db';
import type { Patient, TestOrder } from './types';
import { UpdatablePatientSchema } from './types';

// --- PATIENT ACTIONS ---

const PatientFormSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string().length(10, 'Contact number must be exactly 10 digits.'),
});

export async function createPatient(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = PatientFormSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
    }

    const allPatients = await db.getAllPatients();
    const nextIdNum = allPatients.length + 1;
    const patientId = `PAT${nextIdNum.toString().padStart(3, '0')}`;

    const newPatientData: Patient = {
      patientId,
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      gender: parsed.data.gender as "Male" | "Female" | "Other",
      createdAt: new Date(),
    };

    const newPatient = await db.insertPatient(newPatientData);

    revalidatePath('/patients');
    revalidatePath('/orders/new');
    revalidatePath('/');
    revalidatePath('/data-entry');

    return { success: true, message: 'Patient created successfully.', patientId: newPatient.patientId };
  } catch (error) {
    console.error('Create Patient Error:', error);
    return { success: false, message: 'An error occurred while creating the patient.' };
  }
}

export async function getPatients(): Promise<Patient[]> {
  return await db.getAllPatients();
}

export async function getPatientById(patientId: string): Promise<Patient | undefined> {
  return await db.getPatient(patientId);
}

export async function updatePatient(patientId: string, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = UpdatablePatientSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
    }

    const updatedData = {
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
    };

    const updatedPatient = await db.updatePatientRecord(patientId, updatedData);

    if (!updatedPatient) {
      return { success: false, message: 'Patient not found.' };
    }

    revalidatePath('/patients');
    revalidatePath(`/patients/${patientId}/edit`);
    return { success: true, message: 'Patient updated successfully.' };

  } catch (error) {
    return { success: false, message: 'An error occurred while updating the patient.' };
  }
}


export async function deletePatient(patientId: string) {
  try {
    const success = await db.removePatient(patientId);
    if (!success) {
      return { success: false, message: 'Patient not found.' };
    }
    revalidatePath('/patients');
    revalidatePath('/orders/new');
    return { success: true, message: 'Patient deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'An error occurred while deleting the patient.' };
  }
}


// --- ORDER ACTIONS ---

const OrderSchema = z.object({
  orderId: z.string().min(1, 'Lab number is required.'),
  patientId: z.string().min(1, 'Patient is required.'),
  labType: z.enum(['in-house', 'outside']),
  manualDiscount: z.coerce.number().min(0).max(80),
  tests: z.array(z.object({
    testName: z.string().min(1, 'Test name is required.'),
    testPrice: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  })).min(1, 'At least one test is required.'),
  referredBy: z.string().optional(),
  specimen: z.string().optional(),
});


export async function createTestOrder(data: unknown) {
  try {
    const parsed = OrderSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.flatten().fieldErrors);
      return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
    }

    const { orderId, patientId, labType, manualDiscount, tests, referredBy, specimen } = parsed.data;
    const subtotal = tests.reduce((acc, test) => acc + test.testPrice, 0);

    // Simplified bill logic without AI
    const totalAmount = subtotal; // Assuming no AI adjustment needed for basic version
    const discountAmount = (totalAmount * manualDiscount) / 100;
    const finalAmount = totalAmount - discountAmount;

    const newOrder: TestOrder = {
      orderId,
      patientId,
      orderDate: new Date(),
      status: 'Pending',
      labType,
      tests,
      totalAmount: subtotal,
      discountApplied: manualDiscount,
      finalAmount: finalAmount,
      referredBy: referredBy || 'Self',
      specimen: specimen || 'N/A',
    };

    await db.insertOrder(newOrder);
    revalidatePath('/');
    revalidatePath('/data-entry');
    return { success: true, message: 'Test order created successfully.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred while creating the order.' };
  }
}

export async function getOrders(labType?: 'in-house' | 'outside'): Promise<TestOrder[]> {
  const allOrders = await db.getAllOrders();
  if (labType) {
    return allOrders.filter(order => order.labType === labType);
  }
  return allOrders;
}

export async function getOrderById(orderId: string): Promise<TestOrder | undefined> {
  return await db.getOrder(orderId);
}

const TestResultSchema = z.object({
  testName: z.string(),
  resultValue: z.string().min(1, 'Result is required.'),
  normalRange: z.string().optional(),
  technicianNotes: z.string().optional(),
});

const DataEntrySchema = z.object({
  orderId: z.string(),
  results: z.array(TestResultSchema),
});


export async function updateTestResults(data: unknown) {
  try {
    const parsed = DataEntrySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: 'Invalid data.', errors: parsed.error.flatten().fieldErrors };
    }

    const { orderId, results } = parsed.data;
    const order = await db.getOrder(orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    const updatedTests = order.tests.map(test => {
      const result = results.find(r => r.testName === test.testName);
      if (result) {
        return {
          ...test,
          resultValue: result.resultValue,
          normalRange: result.normalRange,
          technicianNotes: result.technicianNotes,
        };
      }
      return test;
    });

    await db.updateOrderRecord(orderId, { tests: updatedTests, status: 'Completed' });

    revalidatePath(`/orders/${orderId}/report`);
    revalidatePath(`/orders/${orderId}/entry`);
    revalidatePath('/data-entry');
    revalidatePath('/');
    return { success: true, message: 'Test results updated successfully.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred while updating results.' };
  }
}


// --- REPORT & EXPORT ACTIONS ---

export async function generateReportAction(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'Order not found.' };
    }
    // We are no longer generating the report on the server.
    // The client will construct the HTML and trigger the download.
    return { success: true, message: 'Ready to generate report on client.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to prepare report data.' };
  }
}

export async function exportToCsvAction(labType: 'in-house' | 'outside'): Promise<{ success: boolean; data?: string; message: string }> {
  try {
    const orders = await getOrders(labType);

    if (orders.length === 0) {
      return { success: false, message: 'No orders to export.' };
    }

    const headers = ['Order ID', 'Patient Name', 'Order Date', 'Status', 'Lab Type', 'Final Amount', 'Tests'];
    const rows = orders.map(order => [
      order.orderId,
      order.patient?.fullName || 'N/A',
      order.orderDate.toLocaleDateString(),
      order.status,
      order.labType,
      order.finalAmount.toFixed(2),
      order.tests.map(t => t.testName).join(', ')
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    return { success: true, data: csvContent, message: 'CSV generated.' };

  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to export data.' };
  }
}
