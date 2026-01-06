import "server-only";
import { db } from './firebase-admin';
import { Patient, TestOrder, CustomTestDefinition } from './types';

function getDbPath(labId: string, path: string): string {
    return `laboratories/${labId}/${path}`;
}

// --- CONFIG HELPERS ---

export async function getLabConfig(labId: string) {
    const dbRef = db.ref(getDbPath(labId, 'config'));
    const snapshot = await dbRef.once('value');
    if (!snapshot.exists()) return null;
    return snapshot.val();
}

export async function updateLabConfig(labId: string, config: { displayName?: string, theme?: string }) {
    const dbRef = db.ref(getDbPath(labId, 'config'));
    await dbRef.update(config);
    return config;
}

// --- PATIENT HELPERS ---

export async function getAllPatients(labId: string): Promise<Patient[]> {
    const dbRef = db.ref(getDbPath(labId, 'patients'));
    const snapshot = await dbRef.once('value');

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    const patients = Object.values(data) as any[];

    return patients.map(row => ({
        ...row,
        dateOfBirth: new Date(row.dateOfBirth),
        createdAt: new Date(row.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPatient(labId: string, id: string): Promise<Patient | undefined> {
    const dbRef = db.ref(getDbPath(labId, `patients/${id}`));
    const snapshot = await dbRef.once('value');

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

export async function insertPatient(labId: string, patient: Patient): Promise<Patient> {
    const serializedPatient = {
        ...patient,
        dateOfBirth: patient.dateOfBirth.toISOString(),
        createdAt: patient.createdAt.toISOString()
    };

    const dbRef = db.ref(getDbPath(labId, `patients/${patient.patientId}`));
    await dbRef.set(serializedPatient);

    return patient;
}

export async function updatePatientRecord(labId: string, patientId: string, data: Partial<Patient>): Promise<Patient | null> {
    const current = await getPatient(labId, patientId);
    if (!current) return null;

    const updated = { ...current, ...data };

    const serializedUpdates: any = { ...data };
    if (data.dateOfBirth) serializedUpdates.dateOfBirth = data.dateOfBirth.toISOString();

    const dbRef = db.ref(getDbPath(labId, `patients/${patientId}`));
    await dbRef.update(serializedUpdates);

    return updated;
}

export async function removePatient(labId: string, patientId: string): Promise<boolean> {
    const dbRef = db.ref(getDbPath(labId, `patients/${patientId}`));
    await dbRef.remove();
    return true;
}

// --- ORDER HELPERS ---

export async function getAllOrders(labId: string): Promise<TestOrder[]> {
    const dbRef = db.ref(getDbPath(labId, 'orders'));
    const snapshot = await dbRef.once('value');

    if (!snapshot.exists()) {
        return [];
    }

    const ordersData = snapshot.val();
    const orders = Object.values(ordersData) as any[];

    const results = await Promise.all(orders.map(async (row) => {
        let patient: Patient | undefined;
        try {
            patient = await getPatient(labId, row.patientId);
        } catch (e) {
            console.error(`Failed to fetch patient ${row.patientId} for order ${row.orderId}`);
        }

        return {
            ...row,
            orderDate: new Date(row.orderDate),
            tests: row.tests,
            patient
        };
    }));

    return results.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
}

export async function getOrder(labId: string, id: string): Promise<TestOrder | undefined> {
    const dbRef = db.ref(getDbPath(labId, `orders/${id}`));
    const snapshot = await dbRef.once('value');

    if (!snapshot.exists()) {
        return undefined;
    }

    const row = snapshot.val();

    let patient: Patient | undefined;
    try {
        patient = await getPatient(labId, row.patientId);
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

export async function insertOrder(labId: string, order: TestOrder): Promise<TestOrder> {
    const serializedOrder = {
        ...order,
        orderDate: order.orderDate.toISOString(),
    };

    const dbRef = db.ref(getDbPath(labId, `orders/${order.orderId}`));
    await dbRef.set(serializedOrder);

    return order;
}

export async function updateOrderRecord(labId: string, orderId: string, data: Partial<TestOrder>): Promise<TestOrder | null> {
    const current = await getOrder(labId, orderId);
    if (!current) return null;

    const updated: TestOrder = { ...current, ...data };

    const serializedUpdates: any = { ...data };
    if (data.orderDate) serializedUpdates.orderDate = data.orderDate.toISOString();

    const dbRef = db.ref(getDbPath(labId, `orders/${orderId}`));
    await dbRef.update(serializedUpdates);

    return updated;
}

// --- CUSTOM TEST (GOD MODE) HELPERS ---

export async function getCustomTests(labId: string): Promise<CustomTestDefinition[]> {
    const dbRef = db.ref(getDbPath(labId, 'test_master'));
    const snapshot = await dbRef.once('value');

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    return Object.values(data) as CustomTestDefinition[];
}

export async function insertCustomTest(labId: string, testDef: CustomTestDefinition): Promise<CustomTestDefinition> {
    const dbRef = db.ref(getDbPath(labId, `test_master/${testDef.test_code}`));
    await dbRef.set(testDef);
    return testDef;
}

export async function removeCustomTest(labId: string, testCode: string): Promise<boolean> {
    const dbRef = db.ref(getDbPath(labId, `test_master/${testCode}`));
    await dbRef.remove();
    return true;
}
