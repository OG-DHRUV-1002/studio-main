import { db } from './firebase';
import { ref, get, set, remove, update, query, orderByChild } from 'firebase/database';
import { Patient, TestOrder } from './types';

const LAB_ID = process.env.NEXT_PUBLIC_LAB_ID || 'default-lab';

function getDbPath(path: string): string {
    return `laboratories/${LAB_ID}/${path}`;
}

// --- PATIENT HELPERS ---

export async function getAllPatients(): Promise<Patient[]> {
    const dbRef = ref(db, getDbPath('patients'));
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    // Convert object of objects to array
    const patients = Object.values(data) as any[];

    return patients.map(row => ({
        ...row,
        dateOfBirth: new Date(row.dateOfBirth),
        createdAt: new Date(row.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPatient(id: string): Promise<Patient | undefined> {
    const dbRef = ref(db, getDbPath(`patients/${id}`));
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
        return undefined;
    }

    const row = snapshot.val();
    return {
        ...row,
        dateOfBirth: new Date(row.dateOfBirth),
        createdAt: new Date(row.createdAt)
    };
}

export async function insertPatient(patient: Patient): Promise<Patient> {
    const serializedPatient = {
        ...patient,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        createdAt: patient.createdAt.toISOString()
    };

    const dbRef = ref(db, getDbPath(`patients/${patient.patientId}`));
    await set(dbRef, serializedPatient);

    return patient;
}

export async function updatePatientRecord(patientId: string, data: Partial<Patient>): Promise<Patient | null> {
    const current = await getPatient(patientId);
    if (!current) return null;

    const updated = { ...current, ...data };

    // We need to verify if data contains dates to serialize them
    const serializedUpdates: any = { ...data };
    if (data.dateOfBirth) serializedUpdates.dateOfBirth = data.dateOfBirth.toISOString();
    // createdAt shouldn't change, but if it does...

    const dbRef = ref(db, getDbPath(`patients/${patientId}`));
    await update(dbRef, serializedUpdates);

    return updated;
}

export async function removePatient(patientId: string): Promise<boolean> {
    const dbRef = ref(db, getDbPath(`patients/${patientId}`));
    await remove(dbRef);
    return true;
}

// --- ORDER HELPERS ---

export async function getAllOrders(): Promise<TestOrder[]> {
    const dbRef = ref(db, getDbPath('orders'));
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
        return [];
    }

    const ordersData = snapshot.val();
    const orders = Object.values(ordersData) as any[];

    // Fetch all patients for joining (Optimization: In a real large app, fetch only needed or store patient name in order)
    // For MVP, we will fetch individual patient for each order just like before but async

    const results = await Promise.all(orders.map(async (row) => {
        // If patient fetch fails, we still want the order, maybe with null patient
        let patient: Patient | undefined;
        try {
            patient = await getPatient(row.patientId);
        } catch (e) {
            console.error(`Failed to fetch patient ${row.patientId} for order ${row.orderId}`);
        }

        return {
            ...row,
            orderDate: new Date(row.orderDate),
            // tests are stored as object/array in firebase so no JSON.parse needed if inserted correctly.
            // However, if we serialized with JSON.stringify before, we need to check.
            // In the insertOrder below, I'm NOT JSON.stringifying 'tests' because Firebase supports arrays/objects native.
            // But careful: if the previous SQLite code did JSON.stringify, we might change behavior.
            // I will Store it natively in Firebase.
            tests: row.tests,
            patient
        };
    }));

    return results.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
}

export async function getOrder(id: string): Promise<TestOrder | undefined> {
    const dbRef = ref(db, getDbPath(`orders/${id}`));
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
        return undefined;
    }

    const row = snapshot.val();

    let patient: Patient | undefined;
    try {
        patient = await getPatient(row.patientId);
    } catch (e) {
        console.error(`Failed to fetch patient ${row.patientId} for order ${row.orderId}`);
    }

    return {
        ...row,
        orderDate: new Date(row.orderDate),
        tests: row.tests,
        patient
    };
}

export async function insertOrder(order: TestOrder): Promise<TestOrder> {
    const serializedOrder = {
        ...order,
        orderDate: order.orderDate.toISOString(),
        // Firebase handles arrays/objects automatically, no need to stringify tests
    };

    const dbRef = ref(db, getDbPath(`orders/${order.orderId}`));
    await set(dbRef, serializedOrder);

    return order;
}

export async function updateOrderRecord(orderId: string, data: Partial<TestOrder>): Promise<TestOrder | null> {
    const current = await getOrder(orderId);
    if (!current) return null;

    const updated: TestOrder = { ...current, ...data };

    const serializedUpdates: any = { ...data };
    // No date update in updateOrderRecord usually (status/tests only), but good to be safe
    if (data.orderDate) serializedUpdates.orderDate = data.orderDate.toISOString();

    const dbRef = ref(db, getDbPath(`orders/${orderId}`));
    await update(dbRef, serializedUpdates);

    return updated;
}
