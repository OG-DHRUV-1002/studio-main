import { AppHeader } from "@/components/layout/AppHeader";
import { getPatients } from "@/lib/actions";
import { PatientList } from "@/components/patients/PatientList";

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <>
      <AppHeader title="Patient Management" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <PatientList patients={patients} />
        </div>
      </main>
    </>
  );
}
