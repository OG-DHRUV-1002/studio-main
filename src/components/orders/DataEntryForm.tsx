'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { TestOrder } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { updateTestResults } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PROFILE_DEFINITIONS } from '@/lib/profile-definitions';
import { ProfileDataEntry } from './ProfileDataEntry';

const testResultSchema = z.object({
  testName: z.string(),
  resultValue: z.string().min(1, 'Result is required.'),
  normalRange: z.string().optional(),
  technicianNotes: z.string().optional(),
});

const formSchema = z.object({
  orderId: z.string(),
  results: z.array(testResultSchema),
});

type DataEntryFormValues = z.infer<typeof formSchema>;

interface DataEntryFormProps {
  order: TestOrder;
}

export function DataEntryForm({ order }: DataEntryFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [customTestDefs, setCustomTestDefs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCustom() {
      if (user?.lab_context?.id) {
        try {
          const { getCustomTests } = await import('@/lib/db');
          const tests = await getCustomTests(user.lab_context.id);
          setCustomTestDefs(tests);
        } catch (e) { console.error(e); }
      }
    }
    fetchCustom();
  }, [user]);

  const getProfile = (testName: string) => {
    const standard = PROFILE_DEFINITIONS.find(p => p.profile_name === testName);
    if (standard) return standard;

    const custom = customTestDefs.find(t => t.test_name === testName || t.test_code === testName);
    if (custom && custom.report_config) {
      return {
        profile_id: custom.test_code,
        profile_name: custom.test_name,
        components: custom.report_config.components.map((c: any) => ({
          key: c.key || `key_${Math.random().toString(36).substr(2, 9)}`,
          label: c.label,
          unit: c.unit || '',
          input_type: c.type === 'HEADER' ? 'header' : (c.input_type || 'text'),
          options: c.options, // Pass options
          validation: { ref_range_text: c.default_range || '' }
        })),
        input_schema: custom.input_schema // Pass the new schema if it exists
      } as any;
    }
    return null;
  };

  const form = useForm<DataEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: order.orderId,
      results: order.tests.map(t => ({
        testName: t.testName,
        resultValue: t.resultValue || '',
        normalRange: t.normalRange || '',
        technicianNotes: t.technicianNotes || '',
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'results',
  });

  async function onSubmit(values: DataEntryFormValues) {
    setIsSubmitting(true);
    const result = await updateTestResults(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Test results have been saved.',
      });
      router.push(`/orders/${order.orderId}/report`);
      router.refresh();
    } else {
      toast({
        title: 'Error saving results',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Test Results</CardTitle>
            <CardDescription>
              Provide the results for order <strong>{order.orderId}</strong> for patient <strong>{order.patient?.fullName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Test Name</TableHead>
                    <TableHead className="min-w-[150px]">Result</TableHead>
                    <TableHead className="min-w-[150px]">Normal Range</TableHead>
                    <TableHead className="min-w-[250px]">Technician Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {fields.map((field, index) => {
                    const profile = getProfile(field.testName);

                    if (profile) {
                      const initialValues = field.resultValue && field.resultValue.startsWith('{')
                        ? JSON.parse(field.resultValue)
                        : {};

                      return (
                        <TableRow key={field.id}>
                          <TableCell colSpan={4} className="p-4">
                            <ProfileDataEntry
                              profile={profile}
                              initialValues={initialValues}
                              onChange={(newValues) => {
                                form.setValue(`results.${index}.resultValue`, JSON.stringify(newValues));
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium align-top pt-5">
                          {field.testName}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`results.${index}.resultValue`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Result</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 98.6" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`results.${index}.normalRange`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Normal Range</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 97-99" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`results.${index}.technicianNotes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">Technician Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Any notes..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Results
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
