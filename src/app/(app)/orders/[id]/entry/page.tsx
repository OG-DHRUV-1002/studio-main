import { AppHeader } from "@/components/layout/AppHeader";
import { DataEntryForm } from "@/components/orders/DataEntryForm";
import { getOrderById } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function OrderDataEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(decodeURIComponent(id));

  if (!order) {
    notFound();
  }

  return (
    <>
      <AppHeader title={`Enter Results for ${order.orderId}`} />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <DataEntryForm order={order} />
        </div>
      </main>
    </>
  );
}
