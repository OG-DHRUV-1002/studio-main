"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"

import { cn } from "@/lib/utils"
// Assuming these UI components exist based on typical shadcn structure. 
// If not, standard HTML elements or other available components would be used.
// Since I saw components/ui directory, I will assume standard shadcn components are present.
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

// --- Zod Schema ---
const formSchema = z.object({
    // Row 1
    regDate: z.date(),
    labId: z.string(),
    registeredBy: z.string().min(1, "Registered By is required"),

    // Row 2
    mobile: z.string().length(10, "Mobile number must be 10 digits").regex(/^\d+$/, "Must be numbers only"),
    title: z.string().min(1, "Title is required"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),

    // Row 3
    age: z.coerce.number().min(1, "Age must be greater than 0"),
    gender: z.string().min(1, "Gender is required"),
    email: z.string().email("Invalid email address"),

    // Row 4
    address: z.string().min(1, "Address is required"),

    // Row 5
    consultingDr: z.string().min(1, "Consulting Dr is required"),
    remarks: z.string().min(1, "Remarks are required"),
})

type FormValues = z.infer<typeof formSchema>

// Mock Data for Doctors
const MOCK_DOCTORS = [
    { id: "dr_smith", name: "Dr. Smith" },
    { id: "dr_jones", name: "Dr. Jones" },
    { id: "self", name: "Self" },
]

export function RegistrationForm() {
    const { toast } = useToast()

    // -- Theme & Session Mock --
    // In a real app, this would come from a context or prop
    const sessionLabId: string = "LAB-001"
    const isMegaScan = sessionLabId === "MEGASCAN" // Logic for Red vs Blue

    const themeColorClass = isMegaScan ? "border-red-500 text-red-600 focus:ring-red-500" : "border-gray-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
    const buttonClass = isMegaScan ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            regDate: new Date(),
            labId: sessionLabId,
            registeredBy: "",
            mobile: "",
            title: "",
            firstName: "",
            lastName: "",
            age: 0,
            gender: "",
            email: "",
            address: "",
            consultingDr: "",
            remarks: "",
        },
        mode: "onBlur", // Validate on blur mostly
    })

    // --- Logic Hooks ---

    // 1. Watch Title to update Gender
    const title = form.watch("title")
    React.useEffect(() => {
        if (title === "Mr." || title === "Master") {
            form.setValue("gender", "Male")
        } else if (title === "Mrs." || title === "Ms.") {
            form.setValue("gender", "Female")
        }
        // "Dr." and "Baby of" leave it as is or allow manual selection
    }, [title, form])

    // 2. Mobile Search Logic (Mocked)
    const handleMobileBlur = async () => {
        const mobile = form.getValues("mobile")
        if (mobile && mobile.length === 10) {
            // Mock API call
            console.log("Searching history for mobile:", mobile)
            toast({
                title: "Patient Found",
                description: "Mock: Loaded history for existing patient.",
            })
            // In real app, we would form.setValue(...) here
        }
    }

    // Auto-capitalize First Name
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        if (val.length > 0) {
            const capitalized = val.charAt(0).toUpperCase() + val.slice(1)
            form.setValue("firstName", capitalized)
        } else {
            form.setValue("firstName", val)
        }
    }

    function onSubmit(data: FormValues) {
        console.log("Form Submitted:", data)
        toast({
            title: "Registration Successful",
            description: "Patient has been registered.",
        })
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-5xl mx-auto border border-gray-100">
            <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800">New Patient Registration</h2>
                <p className="text-sm text-gray-500">Enter patient details. All fields are mandatory.</p>
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
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </div>
                                    </div>
                                    {/* Read-only representation */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Lab ID */}
                        <FormField
                            control={form.control}
                            name="labId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Lab ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled className="bg-gray-100 text-gray-500 h-9" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Registered By */}
                        <FormField
                            control={form.control}
                            name="registeredBy"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Registered By <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className={cn("h-9", themeColorClass)}>
                                                <SelectValue placeholder="Select Staff" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Receptionist 1">Receptionist 1</SelectItem>
                                            <SelectItem value="Receptionist 2">Receptionist 2</SelectItem>
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
                                                className={cn("h-9", themeColorClass)}
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
                                                <SelectTrigger className={cn("h-9", themeColorClass)}>
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
                                                className={cn("h-9", themeColorClass)}
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
                                            <Input {...field} className={cn("h-9", themeColorClass)} />
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
                                            <Input {...field} type="number" className={cn("h-9", themeColorClass)} />
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
                                                <SelectTrigger className={cn("h-9", themeColorClass, (title === "Mr." || title === "Mrs." || title === "Ms." || title === "Master") && "bg-gray-50")}>
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
                                        <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Email ID <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" placeholder="patient@example.com" className={cn("h-9", themeColorClass)} />
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
                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Address <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Flat/House No, Area, City"
                                            className={cn("min-h-[60px] resize-none", themeColorClass)}
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
                                            <SelectTrigger className={cn("h-9", themeColorClass)}>
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
                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Remarks <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Clinical history, urgent request, etc." className={cn("h-9", themeColorClass)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className={cn("w-full md:w-auto px-8 font-bold", buttonClass)}>
                            Save Registration
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
