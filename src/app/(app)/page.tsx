
import { getOrders } from "@/lib/actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function DashboardPage() {
  const inHouseOrders = await getOrders('in-house');
  const outsideOrders = await getOrders('outside');

  return (
    <>
      <AppHeader title="Dashboard" />
      <main className="flex-1">
        <DashboardClient inHouseOrders={inHouseOrders} outsideOrders={outsideOrders} />
      </main>
    </>
  );
}
