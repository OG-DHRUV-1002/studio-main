"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createPatient, updatePatient } from "@/lib/actions"
import type { Patient } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// --- Zod Schema ---
const formSchema = z.object({
  // Row 1
  regDate: z.string().optional(),
  labId: z.string().optional(), // Now editable, optional
  registeredBy: z.string().min(1, "Registered By is required"),

  // Row 2
  mobile: z.string().length(10, "Mobile number must be 10 digits").regex(/^\d+$/, "Must be numbers only"),
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),

  // Row 3 (Demographics)
  age: z.coerce.number().min(1, "Age must be greater than 0"),
  gender: z.enum(["Male", "Female", "Other"]),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),

  // Row 4
  address: z.string().optional(),

  // Row 5
  consultingDr: z.string().min(1, "Consulting Dr is required"),
  remarks: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Mock Data
const MOCK_DOCTORS = [
  { id: "dr_smith", name: "Dr. Smith" },
  { id: "dr_jones", name: "Dr. Jones" },
  { id: "self", name: "Self" },
]

const LAB_STAFF = {
  'lab_001_bhonsle': ["Receptionist 1", "Receptionist 2", "Sr. Receptionist"],
  'lab_002_megascan': ["Desk Staff A", "Desk Staff B", "Manager"],
  'default': ["Receptionist 1", "Receptionist 2"]
}

interface PatientFormProps {
  patient?: Patient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isEditMode = !!patient

  // Determine styling based on context
  const labTheme = user?.lab_context?.theme || 'blue'
  const isRedTheme = labTheme === 'red' || user?.lab_context?.id === 'lab_002_megascan'

  // FIX: Separate Focus/Text colors from Border colors. 
  // Only apply border color if valid/invalid state is handled, OR just rely on default and use ring color.
  // The user complained about "highlighted in red color". We should remove border-red-500 from base.

  const themeFocusClass = isRedTheme
    ? "focus-visible:ring-red-500 text-gray-900" // Text should be dark, not red (unless error, but handled by FormMessage)
    : "focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-gray-900"

  const buttonClass = isRedTheme
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700"

  // Helper to split Name
  const splitName = (fullName: string) => {
    const parts = fullName.split(" ")
    if (parts.length > 1) {
      return { first: parts[0], last: parts.slice(1).join(" ") }
    }
    return { first: fullName, last: "" }
  }

  const { first: defaultFirst, last: defaultLast } = patient ? splitName(patient.fullName) : { first: "", last: "" }

  const currentLabId = user?.lab_context?.id || 'default';
  const staffOptions = LAB_STAFF[currentLabId as keyof typeof LAB_STAFF] || LAB_STAFF['default'];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regDate: new Date().toISOString().split('T')[0],
      labId: "", // Empty by default as requested
      registeredBy: "", // Force selection
      mobile: patient?.contactNumber || "",
      title: patient?.gender === "Male" ? "Mr." : (patient?.gender === "Female" ? "Mrs." : "Dr."),
      firstName: defaultFirst,
      lastName: defaultLast,
      age: patient ? (new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()) : 0,
      gender: patient?.gender || "Male",
      email: "",
      address: "",
      consultingDr: "self",
      remarks: "",
    },
    mode: "onBlur",
  })

  // --- Logic Hooks ---
  const title = form.watch("title")
  React.useEffect(() => {
    if (!isEditMode) {
      if (title === "Mr." || title === "Master") {
        form.setValue("gender", "Male")
      } else if (title === "Mrs." || title === "Ms.") {
        form.setValue("gender", "Female")
      }
    }
  }, [title, form, isEditMode])

  const handleMobileBlur = async () => {
    const mobile = form.getValues("mobile")
    if (mobile && mobile.length === 10 && !isEditMode) {
      console.log("Searching history for mobile:", mobile)
    }
  }

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.length > 0) {
      const capitalized = val.charAt(0).toUpperCase() + val.slice(1)
      form.setValue("firstName", capitalized)
    } else {
      form.setValue("firstName", val)
    }
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    const fullName = `${data.title} ${data.firstName} ${data.lastName}`.trim()
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - data.age;
    const dob = new Date(`${birthYear}-01-01`);

    const formData = new FormData()
    formData.append("fullName", fullName)
    formData.append("contactNumber", data.mobile)
    formData.append("gender", data.gender)
    formData.append("dateOfBirth", dob.toISOString().split('T')[0])

    const result = isEditMode
      ? await updatePatient(patient!.patientId, formData)
      : await createPatient(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast({ title: "Success!", description: result.message })
      router.refresh()
      if (isEditMode) {
        router.push("/patients")
      } else if ('patientId' in result && result.patientId) {
        router.push(`/patients/${result.patientId}/edit`)
      } else {
        // Reset mostly, but keep some defaults if needed? No, full reset is safer.
        // Actually, maybe we want to keep Reg By? 
        // For now, full reset.
        form.reset({
          ...data,
          mobile: "",
          firstName: "",
          lastName: "",
          age: 0,
          regDate: new Date().toISOString().split('T')[0],
          // Keep registeredBy and labId potentially? User didn't specify persistence, 
          // but standard LIMS workflow usually persists session values. 
          // Let's reset purely patient data.
        })
        toast({ title: "Ready for next patient", description: "Form cleared." })
        // router.push('/patients') 
      }
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-5xl mx-auto border border-gray-100">
      <div className="mb-6 border-b pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Patient' : 'New Patient Registration'}</h2>
          <p className="text-sm text-gray-500">
            {isEditMode ? 'Update patient details.' : 'Enter patient details. All fields are mandatory.'}
          </p>
        </div>
        {!user && <div className="text-xs text-red-500">Offline / No Context</div>}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* --- ROW 1: System Metadata --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reg Date */}
            <FormField
              control={form.control}
              name="regDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Reg. Date</FormLabel>
                  <div className="relative">
                    <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-[#eee] px-3 py-2 text-sm text-muted-foreground shadow-sm ring-offset-background">
                      <span>{field.value}</span>
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lab ID - EDITABLE NOW */}
            <FormField
              control={form.control}
              name="labId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Lab ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Lab No."
                      className={cn("h-9", themeFocusClass)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Registered By - SPECIFIC DROPDOWN */}
            <FormField
              control={form.control}
              name="registeredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Registered By <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn("h-9", themeFocusClass)}>
                        <SelectValue placeholder="Select Receptionist" />
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

          {/* --- ROW 2: Patient Identity --- */}
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* Mobile - 3 Cols */}
            <div className="col-span-12 md:col-span-3">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Mobile <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className={cn("h-9", themeFocusClass)} // No border-red-500 forced here
                        onBlur={(e) => {
                          field.onBlur()
                          handleMobileBlur()
                        }}
                        placeholder="10-digit number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title - 2 Cols */}
            <div className="col-span-12 md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Title <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn("h-9", themeFocusClass)}>
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

            {/* First Name - 3.5 Cols */}
            <div className="col-span-12 md:col-span-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn("h-9", themeFocusClass)}
                        onChange={(e) => {
                          field.onChange(e)
                          handleFirstNameChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Last Name - 3.5 Cols */}
            <div className="col-span-12 md:col-span-3">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Last Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} className={cn("h-9", themeFocusClass)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* --- ROW 3: Demographics --- */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Age - 2 Cols */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Age (Yrs) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className={cn("h-9", themeFocusClass)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gender - 3 Cols */}
            <div className="md:col-span-3">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Gender <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={title === "Mr." || title === "Mrs." || title === "Ms." || title === "Master"}>
                      <FormControl>
                        <SelectTrigger className={cn("h-9", themeFocusClass, (title === "Mr." || title === "Mrs." || title === "Ms." || title === "Master") && "bg-gray-50")}>
                          <SelectValue placeholder="Gender" />
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

            {/* Email - 7 Cols */}
            <div className="md:col-span-7">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Email ID</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="patient@example.com" className={cn("h-9", themeFocusClass)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* --- ROW 4: Address --- */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Flat/House No, Area, City"
                      className={cn("min-h-[60px] resize-none", themeFocusClass)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- ROW 5: Consulting & Notes --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consulting Dr */}
            <FormField
              control={form.control}
              name="consultingDr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Consulting Dr. <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn("h-9", themeFocusClass)}>
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_DOCTORS.map(dr => (
                        <SelectItem key={dr.id} value={dr.id}>{dr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Remarks</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Clinical history, urgent request, etc." className={cn("h-9", themeFocusClass)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className={cn("w-full md:w-auto px-8 font-bold", buttonClass)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Record' : 'Save Registration'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
