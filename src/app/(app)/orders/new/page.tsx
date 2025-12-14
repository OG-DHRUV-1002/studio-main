import { AppHeader } from "@/components/layout/AppHeader";
import { NewOrderForm } from "@/components/orders/NewOrderForm";
import { getPatients } from "@/lib/actions";

export default async function NewOrderPage() {
  const patients = await getPatients();
  
  return (
    <>
      <AppHeader title="New Test Order" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
           <NewOrderForm patients={patients} />
        </div>
      </main>
    </>
  );
}
