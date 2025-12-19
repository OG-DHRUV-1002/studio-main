
import { AppHeader } from "@/components/layout/AppHeader";
import { getOrderById } from "@/lib/actions";
import { NewOrderForm } from "@/components/orders/NewOrderForm";
import { getPatients } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Fetch Order and Patients
    const [order, patients] = await Promise.all([
        getOrderById(id),
        getPatients() // Needed for NewOrderForm prop (though maybe unused if purely manual entry)
    ]);

    if (!order) {
        notFound();
    }

    // 2. Transform TestOrder -> NewOrderFormValues
    // We need to map the backend TestOrder to the frontend Form schema
    const initialData = {
        orderId: order.orderId,
        // Patient Details (Embedded in order.patient or separate?)
        // The order.patient is likely the embedded version.
        // We should primarily rely on the order's patient link, but order.patient object is available
        title: (order.patient?.title as "Mr." | "Mrs." | "Ms." | "Master" | "Baby of" | "Dr.") || 'Mr.',
        fullName: order.patient?.fullName || '',
        age: order.patient?.dateOfBirth ? (new Date().getFullYear() - new Date(order.patient.dateOfBirth).getFullYear()) : 0,
        gender: order.patient?.gender || 'Male',
        email: order.patient?.email || '',
        contactNumber: order.patient?.contactNumber || '',
        address: order.patient?.address || '',
        registeredBy: order.patient?.registeredBy || '',

        labType: order.labType,
        manualDiscount: order.discountApplied || 0,
        tests: order.tests.map(t => ({
            testName: t.testName,
            testPrice: t.testPrice
        })),
        referredBy: order.referredBy === 'Self' ? '' : order.referredBy, // If 'Self', show empty or 'Self'? Form defaults empty is cleaner if optional.
        specimen: order.specimen === 'N/A' ? '' : order.specimen,
        remarks: order.patient?.remarks || ''
    };

    return (
        <>
            <AppHeader title={`Edit Order: ${id}`} />
            <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                <NewOrderForm
                    patients={patients}
                    initialData={initialData}
                    isEditMode={true}
                />
            </main>
        </>
    );
}
