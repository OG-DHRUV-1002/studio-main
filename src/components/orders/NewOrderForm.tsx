
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Trash2, PlusCircle, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import type { Patient } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createTestOrder } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PatientCombobox } from './PatientCombobox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { allTests, testProfiles } from '@/lib/tests';
import { Input } from '../ui/input';


const testSchema = z.object({
  testName: z.string().min(1, 'Test name is required.'),
  testPrice: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
});

const formSchema = z.object({
  orderId: z.string().min(1, 'Lab number is required.'),
  patientId: z.string().min(1, 'Patient is required.'),
  labType: z.enum(['in-house', 'outside']),
  manualDiscount: z.coerce.number().min(0).max(80),
  tests: z.array(testSchema).min(1, 'At least one test is required.'),
  referredBy: z.string().optional(),
  specimen: z.string().optional(),
});

type NewOrderFormValues = z.infer<typeof formSchema>;

interface NewOrderFormProps {
  patients: Patient[];
}

const TestCombobox = ({ value, onSelect, onPriceChange }: { value: string, onSelect: (value: string) => void, onPriceChange: (price: number) => void }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (testName: string) => {
    const test = allTests.find(t => t.name === testName);
    if (test) {
      onSelect(test.name);
      onPriceChange(test.price);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value : 'Select test...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search test..." />
          <CommandList>
            <CommandEmpty>No test found.</CommandEmpty>
            {Object.entries(testProfiles).map(([category, tests]) => (
                <CommandGroup key={category} heading={category}>
                    {tests.map((test) => (
                        <CommandItem
                            key={test.name}
                            value={test.name}
                            onSelect={() => handleSelect(test.name)}
                        >
                            <Check
                                className={cn(
                                    'mr-2 h-4 w-4',
                                    value === test.name ? 'opacity-100' : 'opacity-0'
                                )}
                            />
                            {test.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


export function NewOrderForm({ patients }: NewOrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: '',
      patientId: '',
      labType: 'in-house',
      manualDiscount: 0,
      tests: [{ testName: '', testPrice: 0 }],
      referredBy: '',
      specimen: '',
    },
  });
  
  const labType = form.watch('labType');
  const tests = form.watch('tests');

  useEffect(() => {
    document.body.classList.remove('theme-outside');
    if (labType === 'outside') {
      document.body.classList.add('theme-outside');
    }
    return () => {
      document.body.classList.remove('theme-outside');
    };
  }, [labType]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tests',
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name?.startsWith('tests') && name.endsWith('testName')) {
        const index = parseInt(name.split('.')[1]);
        const testName = value.tests?.[index].testName;
        const test = allTests.find(t => t.name === testName);
        if (test) {
            form.setValue(`tests.${index}.testPrice`, test.price, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);


  async function onSubmit(values: NewOrderFormValues) {
    setIsSubmitting(true);
    const result = await createTestOrder(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      router.push('/');
    } else {
      toast({
        title: 'Error creating order',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      if (result.errors) {
        console.log(result.errors);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
           <CardHeader>
            <CardTitle>Patient &amp; Order Details</CardTitle>
            <CardDescription>Select a patient and specify the order type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab No.</FormLabel>
                      <FormControl>
                         <Input placeholder="e.g., A123-B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Patient</FormLabel>
                       <PatientCombobox
                        patients={patients}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="labType"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Lab Type</FormLabel>
                        <FormMessage />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn('transition-colors', field.value === 'in-house' ? 'font-semibold text-primary' : '')}>In-House</span>
                        <FormControl>
                          <Switch
                            checked={field.value === 'outside'}
                            onCheckedChange={(checked) => field.onChange(checked ? 'outside' : 'in-house')}
                          />
                        </FormControl>
                        <span className={cn('transition-colors', field.value === 'outside' ? 'font-semibold text-primary' : '')}>Outside</span>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referred By</FormLabel>
                      <FormControl>
                         <Input placeholder="e.g., Dr. Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specimen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specimen</FormLabel>
                      <FormControl>
                         <Input placeholder="e.g., Blood, Urine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tests</CardTitle>
            <CardDescription>Add one or more tests to this order. Prices are entered manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4">
                 <FormField
                  control={form.control}
                  name={`tests.${index}.testName`}
                  render={({ field: formField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className={cn(index !== 0 && "sr-only")}>Test Name</FormLabel>
                       <TestCombobox
                          value={formField.value}
                          onSelect={(value) => {
                            form.setValue(`tests.${index}.testName`, value, { shouldValidate: true });
                          }}
                          onPriceChange={(price) => {
                             form.setValue(`tests.${index}.testPrice`, price, { shouldValidate: true });
                          }}
                        />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tests.${index}.testPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn("mt-8", fields.length <= 1 && "invisible")}
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ testName: '', testPrice: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Test
            </Button>
          </CardContent>
        </Card>

        {labType === 'in-house' && (
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Apply discounts and finalize the amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="manualDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual Discount</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a discount" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80].map(d => (
                          <SelectItem key={d} value={String(d)}>{d}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Test Order
              </Button>
            </CardFooter>
          </Card>
        )}

         {labType === 'outside' && (
             <Card>
                <CardHeader>
                    <CardTitle>Finalize Order</CardTitle>
                    <CardDescription>Review and create the test order.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Test Order
                    </Button>
                </CardFooter>
             </Card>
         )}
      </form>
    </Form>
  );
}
