
import { AppHeader } from "@/components/layout/AppHeader";
import { PatientForm } from "@/components/patients/PatientForm";
import { getPatientById } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatientById(decodeURIComponent(id));

  if (!patient) {
    notFound();
  }

  return (
    <>
      <AppHeader title="Edit Patient" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <PatientForm patient={patient} />
        </div>
      </main>
    </>
  );
}
