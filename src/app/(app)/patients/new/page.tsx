import { AppHeader } from "@/components/layout/AppHeader";
import { PatientForm } from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <>
      <AppHeader title="Patient Management" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
           <PatientForm />
        </div>
      </main>
    </>
  );
}
