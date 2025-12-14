import { AppHeader } from "@/components/layout/AppHeader";
import { ReportClient } from "@/components/reports/ReportClient";
import { getOrderById } from "@/lib/actions";
import { notFound } from "next/navigation";


export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrderById(decodeURIComponent(id));

    if (!order) {
        notFound();
    }

    return (
        <>
            <AppHeader title={`Report: ${order.orderId}`} />
            <main className="flex-1 p-4 md:p-8">
                <ReportClient order={order} />
            </main>
        </>
    );
}
