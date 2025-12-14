
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, PlusCircle, Trash2, Pencil } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { deletePatient } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface PatientListProps {
  patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (patientId: string) => {
    setIsDeleting(patientId);
    const result = await deletePatient(patientId);
    setIsDeleting(null);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const calculateAge = (dob: Date) => {
    const ageDifMs = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            View, edit, or delete patient records.
          </CardDescription>
        </div>
        <Button onClick={() => router.push('/patients/new')}>
          <PlusCircle />
          Add New Patient
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="font-medium">
                    {patient.patientId}
                  </TableCell>
                  <TableCell>{patient.fullName}</TableCell>
                  <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contactNumber}</TableCell>
                  <TableCell className="text-right space-x-2">
                     <Button variant="ghost" size="icon" asChild>
                        <Link href={`/patients/${patient.patientId}/edit`}>
                           <Pencil className="text-primary" />
                        </Link>
                     </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isDeleting === patient.patientId}>
                          {isDeleting === patient.patientId ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 className="text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the patient record for{' '}
                            <strong>{patient.fullName}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(patient.patientId)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
