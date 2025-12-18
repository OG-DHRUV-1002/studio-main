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
import { createWalkInOrder } from '@/lib/actions'; // CHANGED: Use new action
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { PatientCombobox } from './PatientCombobox'; // REMOVED
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { allTests, testProfiles } from '@/lib/tests';
import { Input } from '../ui/input';
import { useAuth } from '@/lib/auth-context';


const LAB_STAFF = {
  'lab_001_bhonsle': ["Receptionist 1", "Receptionist 2", "Sr. Receptionist"],
  'lab_002_megascan': ["Desk Staff A", "Desk Staff B", "Manager"],
  'default': ["Receptionist 1", "Receptionist 2"]
}

const testSchema = z.object({
  testName: z.string().min(1, 'Test name is required.'),
  testPrice: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
});

// CHANGED: Walk-In Schema (Unified)
const formSchema = z.object({
  orderId: z.string().min(1, 'Lab number is required.'),
  // Patient Fields
  fullName: z.string().min(3, 'Full name is required.'),
  title: z.enum(['Mr.', 'Mrs.', 'Ms.', 'Master', 'Baby of', 'Dr.']),
  age: z.coerce.number().min(0, 'Age is required.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  email: z.string().email().optional().or(z.literal('')),
  contactNumber: z.string().min(10, 'Contact number is required (10 digits).').max(15, 'Invalid number'),
  address: z.string().optional(),
  registeredBy: z.string().min(1, 'Registered By is required'),

  labType: z.enum(['in-house', 'outside']),
  manualDiscount: z.coerce.number().min(0).max(80),
  tests: z.array(testSchema).min(1, 'At least one test is required.'),
  referredBy: z.string().optional(),
  specimen: z.string().optional(),
  remarks: z.string().optional(),
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
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLabId = user?.lab_context?.id || 'default';
  const staffOptions = LAB_STAFF[currentLabId as keyof typeof LAB_STAFF] || LAB_STAFF['default'];

  const form = useForm<NewOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: '',
      title: 'Mr.',
      fullName: '',
      age: 0,
      gender: 'Male',
      email: '',
      contactNumber: '',
      address: '',
      registeredBy: '',
      labType: 'in-house',
      manualDiscount: 0,
      tests: [{ testName: '', testPrice: 0 }],
      referredBy: '',
      specimen: '',
      remarks: '',
    },
  });

  const labType = form.watch('labType');
  const tests = form.watch('tests');
  const title = form.watch('title');

  // Auto-set gender based on title
  useEffect(() => {
    if (title === 'Mr.' || title === 'Master') {
      form.setValue('gender', 'Male');
    } else if (title === 'Mrs.' || title === 'Ms.') {
      form.setValue('gender', 'Female');
    }
  }, [title, form]);

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
        const testName = value.tests?.[index]?.testName;
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
    // CHANGED: Use createWalkInOrder
    const result = await createWalkInOrder(values);
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Walk-In Registration</CardTitle>
            <CardDescription>Enter patient details. Patient ID will be same as Lab No.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Lab No Generator */}
            {/* Lab No Generator & Registered By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab No. / Patient ID</FormLabel>
                    <FormControl>
                      <div className="flex rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring">
                        <div className="flex h-9 items-center rounded-l-md border-r bg-muted px-3 text-sm text-muted-foreground">
                          {new Date().toLocaleString('default', { month: 'long' }).slice(0, 4) + '_'}
                        </div>
                        <Input
                          placeholder="1234"
                          className="flex-1 border-0 focus-visible:ring-0 rounded-l-none"
                          value={field.value ? field.value.split('_')[1] || '' : ''}
                          onChange={(e) => {
                            const prefix = new Date().toLocaleString('default', { month: 'long' }).slice(0, 4) + '_';
                            field.onChange(prefix + e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registeredBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Staff" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffOptions.map(staff => (
                          <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Patient Details - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Master">Master</SelectItem>
                          <SelectItem value="Baby of">Baby of</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Full Name */}
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mobile */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit Mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email (New) - Fits in remaining column space or new row? Let's give it 3 cols */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 2: Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 35" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={title === 'Mr.' || title === 'Mrs.' || title === 'Ms.' || title === 'Master'}>
                      <FormControl>
                        <SelectTrigger className={(title === 'Mr.' || title === 'Mrs.' || title === 'Ms.' || title === 'Master') ? 'bg-gray-100' : ''}>
                          <SelectValue placeholder="Select Gender" />
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

            {/* Row 3: Address (New) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Flat/House No, Area, City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rest of Form (Referral, Specimen, Lab Type) */}
            <FormField
              control={form.control}
              name="labType"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Remarks (New) */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks / Clinical History</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
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
