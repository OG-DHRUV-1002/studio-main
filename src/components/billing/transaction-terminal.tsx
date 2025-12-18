'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, onValue } from "firebase/database";
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Transaction } from '@/lib/types';
import { markOrderAsPaid } from '@/lib/actions';
import InvoicePreview from '@/components/billing/invoice-preview';
import PaymentTerminal from '@/components/billing/payment-terminal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Transaction for initial load (in real app, fetch via API from orderId)
const MOCK_TRANSACTION: Transaction = {
    invoice_id: "INV-2025-X9Y2",
    patient_id: "P-505",
    patient_name: "Salmabibi Mandal",
    age: 38,
    gender: "Female",
    ref_doctor: "Dr. Anop S Shah",
    lab_id: "lab_003_general",
    amount: 1500,
    payment_mode: 'online',
    status: 'PENDING',
    timestamp: "2025-12-18T20:00:00.000Z",
    items: [
        { test_name: "Thyroid Stimulating Hormone-TSH", price: 430 },
        { test_name: "CA-125", price: 1070 }
    ],
    qr_string: "upi://pay?pa=mock@upi&pn=AnvikshaLab&am=1500"
};

export default function TransactionTerminal() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [transaction, setTransaction] = useState<Transaction>(MOCK_TRANSACTION);
    const { user, loading } = useAuth();
    const labId = user?.lab_context.id;

    // Handle Loading & Auth
    if (loading) return <div className="h-full flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div> Loading Terminal...</div>;

    if (!user) return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-4">
            <div className="text-red-500 font-bold text-xl">Authorization Error</div>
            <p className="text-gray-600">You must be logged in to access the billing terminal.</p>
            <Button onClick={() => window.location.reload()}>Retry Login</Button>
        </div>
    );

    if (!labId) return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center gap-4">
            <div className="text-orange-500 font-bold text-xl">Lab Context Missing</div>
            <p className="text-gray-600">Your user account is not associated with a valid laboratory.</p>
        </div>
    );

    // Initial Fetch with Real Data from Firebase
    useEffect(() => {
        if (orderId && labId) {
            async function fetchOrder() {
                try {
                    // Dynamic Import to avoid server-side issues
                    const { getOrder } = await import('@/lib/db');
                    const orderData = await getOrder(labId, orderId as string);

                    if (orderData) {
                        const age = orderData.patient?.dateOfBirth ?
                            new Date().getFullYear() - new Date(orderData.patient.dateOfBirth).getFullYear()
                            : 0;

                        setTransaction({
                            invoice_id: orderData.orderId,
                            patient_id: orderData.patientId,
                            patient_name: orderData.patient?.fullName || "Unknown",
                            age: age,
                            gender: orderData.patient?.gender || "Unknown",
                            mobile: orderData.patient?.contactNumber || "",
                            ref_doctor: orderData.referredBy || "SELF",
                            ref_id: "", // Placeholder as per requirement
                            lab_id: labId as string,
                            amount: orderData.finalAmount,
                            payment_mode: 'CASH', // Default start
                            status: orderData.status === 'Completed' ? 'SUCCESS' : 'PENDING',
                            timestamp: orderData.orderDate.toString(), // Ensure string
                            items: (orderData.tests || []).map(t => ({
                                test_name: t.testName,
                                price: t.testPrice || 0
                            })),
                            qr_string: `upi://pay?pa=${user?.lab_context.phone || '9876543210'}@upi&pn=${user?.lab_context.display_name}&am=${orderData.finalAmount}&tr=${orderData.orderId}`
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch order:", error);
                }
            }
            fetchOrder();
        }
    }, [orderId, labId, user]);

    // Real-time Listener for Payment Updates
    useEffect(() => {
        if (!transaction?.invoice_id || transaction.invoice_id === "INV-2025-X9Y2") return;

        // Path: transactions/{lab_id}/{invoice_id}
        const txRef = ref(db, `transactions/${transaction.lab_id}/${transaction.invoice_id}`);

        const unsubscribe = onValue(txRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status) {
                console.log("Real-time update:", data);
                setTransaction(prev => ({
                    ...prev,
                    status: data.status,
                    payment_mode: data.payment_mode || prev.payment_mode
                }));
            }
        });

        return () => unsubscribe();
    }, [transaction.invoice_id, transaction.lab_id]);

    const handlePaymentModeChange = (mode: 'CASH' | 'online') => {
        setTransaction(prev => ({ ...prev, payment_mode: mode }));
    };

    const handleSimulateSuccess = async () => {
        setTransaction(prev => ({ ...prev, status: 'SUCCESS' }));
        if (orderId) {
            await markOrderAsPaid(orderId);
        }
    };

    return (
        <div className="h-full w-full bg-gray-100 flex flex-col overflow-hidden">
            {/* Header / Navigation */}
            <div className="bg-white border-b px-6 py-3 flex items-center gap-4 shrink-0 no-print">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-black gap-2"
                    onClick={() => window.history.back()}
                >
                    &larr; Back to Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <h2 className="font-semibold text-gray-700">Transaction Terminal</h2>
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                    Order: {orderId || 'N/A'}
                </Badge>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Invoice Preview - 65% Width */}
                <div className="w-[65%] p-8 overflow-y-auto flex items-center justify-center bg-gray-500/10 border-r border-gray-200">
                    <div className="w-full max-w-[210mm] shadow-2xl origin-top scale-95 lg:scale-100 transition-transform">
                        <InvoicePreview transaction={transaction} />
                    </div>
                </div>

                {/* Right: Payment Terminal - 35% Width */}
                <div className="w-[35%] bg-white z-10 shadow-xl flex flex-col">
                    <PaymentTerminal
                        transaction={transaction}
                        onPaymentModeChange={handlePaymentModeChange}
                        onSimulateSuccess={handleSimulateSuccess}
                    />
                </div>
            </div>
        </div>
    );
}
