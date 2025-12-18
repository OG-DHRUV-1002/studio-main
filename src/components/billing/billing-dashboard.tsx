'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Pencil, CloudFog, FileText, Info, AlertTriangle, Printer } from 'lucide-react';
import { TestOrder } from '@/lib/types';
import { format } from 'date-fns';

interface BillingDashboardProps {
    initialOrders: TestOrder[];
}

export default function BillingDashboard({ initialOrders }: BillingDashboardProps) {
    const router = useRouter();

    const handleAction = (action: string, orderId: string) => {
        if (action === 'bill') {
            router.push(`/billing/terminal?orderId=${orderId}`);
        }
        console.log(`Action: ${action} on Order: ${orderId}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Billing & Transactions</h1>
            </div>

            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="font-bold text-black">Patient Name</TableHead>
                            <TableHead className="font-bold text-black">Age</TableHead>
                            <TableHead className="font-bold text-black w-[30%]">Services</TableHead>
                            <TableHead className="font-bold text-black">Expected Date</TableHead>
                            <TableHead className="font-bold text-black">Status</TableHead>
                            <TableHead className="font-bold text-black">Amount</TableHead>
                            <TableHead className="font-bold text-black">Print Status</TableHead>
                            <TableHead className="font-bold text-black">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOrders.length > 0 ? initialOrders.map((order) => {
                            const age = order.patient?.dateOfBirth ?
                                new Date().getFullYear() - new Date(order.patient.dateOfBirth).getFullYear()
                                : 'N/A';
                            const formattedDate = order.orderDate ? format(new Date(order.orderDate), 'dd-MMM-yyyy HH:mm') : 'N/A';

                            return (
                                <TableRow key={order.orderId} className="hover:bg-gray-50">
                                    <TableCell className="font-medium text-gray-700">{order.patient?.fullName || 'Unknown'}</TableCell>
                                    <TableCell className="text-gray-600">{age} Yrs</TableCell>
                                    <TableCell className="text-gray-600 text-sm">{order.tests.map(t => t.testName).join(', ')}</TableCell>
                                    <TableCell className="text-gray-600 whitespace-nowrap">{formattedDate}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Payment Pending' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-800">₹{order.finalAmount}</TableCell>
                                    <TableCell className="text-gray-500 italic">Not Printed</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="default" size="sm" className="bg-[#1f5f5f] hover:bg-[#164242] text-white h-8 w-8 p-0 rounded-sm">
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleAction('edit', order.orderId)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Order
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction('bill', order.orderId)}>
                                                        <FileText className="mr-2 h-4 w-4" /> Generate Bill
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" title="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600" title="Accession">
                                                <CloudFog className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                title="Download/Print Bill"
                                                onClick={() => handleAction('bill', order.orderId)}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" title="Info">
                                                <Info className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" title="Alert">
                                                <AlertTriangle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                                    No orders found. Create a new order to see it here.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}
