
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPatient, updatePatient } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Patient } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters long.' }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format. Use YYYY-MM-DD."}),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Gender is required.',
  }),
  contactNumber: z.string().length(10, { message: 'Contact number must be exactly 10 digits.' }),
});

interface PatientFormProps {
    patient?: Patient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!patient;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: patient ? {
        fullName: patient.fullName,
        dateOfBirth: formatDateForInput(new Date(patient.dateOfBirth)),
        gender: patient.gender,
        contactNumber: patient.contactNumber,
    } : {
      fullName: '',
      dateOfBirth: '',
      gender: undefined,
      contactNumber: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string);
    });
    
    const result = isEditMode
      ? await updatePatient(patient.patientId, formData)
      : await createPatient(formData);
    
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });

      // We need to refresh the router to see the changes
      router.refresh();

      if (isEditMode) {
        router.push('/patients');
      } else if (result.patientId) {
        router.push(`/patients/${result.patientId}/edit`);
      } else {
         router.push('/patients');
      }
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Patient' : 'Register New Patient'}</CardTitle>
        <CardDescription>
            {isEditMode ? `Update the details for ${patient.fullName}.` : 'Add a new patient record to the system.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input type="tel" maxLength={10} placeholder="10-digit mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Register Patient'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
