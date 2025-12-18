
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, set } from "firebase/database";
import { Transaction } from '@/lib/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patientId, patientName, age, gender, refDoctor, labId, items, totalAmount } = body;

        // Generate Invoice ID
        const date = new Date();
        const year = date.getFullYear();
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const invoice_id = `INV-${year}-${randomStr}`;

        // Create UPI String (Mock or Real)
        // Format: upi://pay?pa=[merchant_vpa]&pn=[merchant_name]&am=[amount]&tr=[transaction_ref]&tn=[note]
        // This is a standard UPI string format. Replace placeholders with real VPA if available.
        const vpa = "anvikshalab@upi"; // Dynamic if stored in lab profile
        const upi_string = `upi://pay?pa=${vpa}&pn=${labId}&am=${totalAmount}&tr=${invoice_id}&tn=LabTest`;

        const newTransaction: Transaction = {
            invoice_id,
            patient_id: patientId,
            patient_name: patientName,
            age,
            gender,
            ref_doctor: refDoctor,
            lab_id: labId,
            amount: totalAmount,
            payment_mode: 'online', // Default start
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            items: items || [],
            qr_string: upi_string
        };

        // Save to Firebase Realtime Database
        // Path: transactions/{lab_id}/{invoice_id}
        await set(ref(db, `transactions/${labId}/${invoice_id}`), newTransaction);

        return NextResponse.json({
            success: true,
            invoice_id,
            qr_string: upi_string,
            payment_link: upi_string // In real gateway, this would be a web URL
        });

    } catch (error) {
        console.error("Transaction Create Error:", error);
        return NextResponse.json({ success: false, error: "Failed to create transaction" }, { status: 500 });
    }
}
