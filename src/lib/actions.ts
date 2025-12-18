'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import * as db from './db';
import type { Patient, TestOrder } from './types';
import { UpdatablePatientSchema } from './types';
import { getCurrentLabId } from './auth-server';

// --- PATIENT ACTIONS ---

const PatientFormSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string().length(10, 'Contact number must be exactly 10 digits.'),
});

export async function createPatient(formData: FormData) {
  try {
    const labId = await getCurrentLabId();
    const data = Object.fromEntries(formData.entries());
    const parsed = PatientFormSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
    }

    const allPatients = await db.getAllPatients(labId);
    const nextIdNum = allPatients.length + 1;
    const prefix = new Date().toLocaleString('default', { month: 'long' }).slice(0, 4) + '_';
    const patientId = `${prefix}${nextIdNum}`;

    const newPatientData: Patient = {
      patientId,
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      gender: parsed.data.gender as "Male" | "Female" | "Other",
      createdAt: new Date(),
    };

    const newPatient = await db.insertPatient(labId, newPatientData);

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
  const labId = await getCurrentLabId();
  return await db.getAllPatients(labId);
}

export async function getPatientById(patientId: string): Promise<Patient | undefined> {
  const labId = await getCurrentLabId();
  return await db.getPatient(labId, patientId);
}

export async function updatePatient(patientId: string, formData: FormData) {
  try {
    const labId = await getCurrentLabId();
    const data = Object.fromEntries(formData.entries());
    const parsed = UpdatablePatientSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, message: 'Invalid form data.', errors: parsed.error.flatten().fieldErrors };
    }

    const updatedData = {
      ...parsed.data,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
    };

    const updatedPatient = await db.updatePatientRecord(labId, patientId, updatedData);

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
    const labId = await getCurrentLabId();
    const success = await db.removePatient(labId, patientId);
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
    const labId = await getCurrentLabId();
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

    await db.insertOrder(labId, newOrder);
    revalidatePath('/');
    revalidatePath('/data-entry');
    return { success: true, message: 'Test order created successfully.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred while creating the order.' };
  }
}

export async function getOrders(labType?: 'in-house' | 'outside'): Promise<TestOrder[]> {
  const labId = await getCurrentLabId();
  const allOrders = await db.getAllOrders(labId);
  if (labType) {
    return allOrders.filter(order => order.labType === labType);
  }
  return allOrders;
}

export async function getOrderById(orderId: string): Promise<TestOrder | undefined> {
  const labId = await getCurrentLabId();
  return await db.getOrder(labId, orderId);
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
    const labId = await getCurrentLabId();
    const parsed = DataEntrySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: 'Invalid data.', errors: parsed.error.flatten().fieldErrors };
    }

    const { orderId, results } = parsed.data;
    const order = await db.getOrder(labId, orderId);
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

    await db.updateOrderRecord(labId, orderId, { tests: updatedTests, status: 'Payment Pending' });

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


export async function markOrderAsPaid(orderId: string) {
  try {
    const labId = await getCurrentLabId();
    await db.updateOrderRecord(labId, orderId, { status: 'Completed' });
    revalidatePath('/');
    revalidatePath('/orders');
    return { success: true, message: 'Payment received. Order completed.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to update order status.' };
  }
}


// --- REPORT & EXPORT ACTIONS ---

export async function generateReportAction(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    // getOrderById already handles labId
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
    const labId = await getCurrentLabId();
    const orders = await getOrders(labType); // getOrders calls getCurrentLabId again or we can optimization, but it's fine. 
    // Wait, getOrders helper above does call getCurrentLabId. But here I want to call db directly or just use helper?
    // Using helper is cleaner but double cookie read. It's fine.

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

// --- SETTINGS ACTIONS ---

export async function updateLabSettings(formData: FormData) {
  try {
    const labId = await getCurrentLabId();
    const displayName = formData.get('displayName') as string;
    const theme = formData.get('theme') as string;

    await db.updateLabConfig(labId, {
      displayName,
      theme
    });

    revalidatePath('/');
    return { success: true, message: 'Settings updated successfully.' };
  } catch (error) {
    console.error('Update Settings Error:', error);
    return { success: false, message: 'An error occurred while updating settings.' };
  }
}
