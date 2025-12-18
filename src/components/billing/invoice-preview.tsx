'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';

interface InvoicePreviewProps {
    transaction: Transaction;
}

export default function InvoicePreview({ transaction }: InvoicePreviewProps) {
    const { user } = useAuth();
    const lab = user?.lab_context;

    // Default fallback if no lab context
    const labName = lab?.display_name || "ANVIKSHA";

    const labAddress = lab?.address || ["1, Paras Darshan, M.G. Road, Ghatkopar (E)", "M - 77"];
    const labEmail = lab?.email || "anvikshalab@gmail.com";
    const labPhone = lab?.phone || "35134351/2/3/4";
    const labWhatsapp = lab?.whatsapp || "8591265830";

    const totalAmount = transaction.amount;
    const paidAmount = transaction.status === 'SUCCESS' ? totalAmount : 0;
    const balanceAmount = totalAmount - paidAmount;

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto text-black font-sans text-sm leading-tight relative shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="w-1/2">
                    <h1 className="text-3xl font-extrabold uppercase tracking-wide">{labName}</h1>

                </div>
                <div className="w-1/2 text-right border border-black p-2 text-xs">
                    {labAddress.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                    <p>Email: {labEmail}</p>
                    <p>Tel.: {labPhone} Whatsapp: {labWhatsapp}</p>
                </div>
            </div>

            {/* Receipt Title - BILL Header */}
            <div className="border-t-2 border-b-2 border-black mb-4 py-1">
                <h2 className="text-center text-xl font-bold uppercase tracking-widest bg-gray-100/50">BILL</h2>
            </div>

            {/* Patient Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-4 border-b-2 border-black pb-4 text-sm font-medium">
                {/* Left Column */}
                <div className="space-y-1">
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Name</span>
                        <span className="uppercase">: {transaction.patient_name}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Gender/Age</span>
                        <span>: {transaction.gender} / {transaction.age} Yrs</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Mobile</span>
                        <span>: {transaction.mobile || ""}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Ref By</span>
                        <span className="uppercase">: {transaction.ref_doctor || "SELF"}</span>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1">
                    <div className="grid grid-cols-[140px_1fr]">
                        <span className="font-bold">Invoice No / Lab ID</span>
                        <span>: {transaction.invoice_id}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                        <span className="font-bold">Invoice Date</span>
                        <span>: {format(new Date(transaction.timestamp), "dd-MMM-yyyy HH:mm")}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                        <span className="font-bold">Patient ID</span>
                        <span>: {transaction.patient_id}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                        <span className="font-bold">Ref ID</span>
                        <span>: {transaction.ref_id || ""}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-4 min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black border-dashed">
                            <th className="py-1 w-12 text-center">Sr. No</th>
                            <th className="py-1">Test Name</th>
                            <th className="py-1 text-center">Report On</th>
                            <th className="py-1 text-right">Rate</th>
                            <th className="py-1 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaction.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300 border-dashed">
                                <td className="py-1 text-center">{index + 1}</td>
                                <td className="py-1">{item.test_name}</td>
                                <td className="py-1 text-center">Same Day</td>
                                <td className="py-1 text-right">{item.price.toFixed(2)}</td>
                                <td className="py-1 text-right">{item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-2 flex justify-between items-end">
                <div className="w-1/2">
                    <p className="mb-4">Done By &nbsp;&nbsp; <span className="uppercase font-bold">ADMIN / {user?.user_uid.split('_')[1]?.toUpperCase() || 'STAFF'}</span></p>


                </div>

                <div className="w-1/3 text-sm">
                    <div className="flex justify-between border-b border-gray-400 py-1">
                        <span>Total Amount</span>
                        <span>{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-400 py-1">
                        <span>Night Charges</span>
                        <span>0.00</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-400 py-1 font-bold">
                        <span>Bill Amount</span>
                        <span>{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-400 py-1">
                        <span>Amount Paid</span>
                        <span>{paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-bold">
                        <span>Balance</span>
                        <span>{balanceAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="text-xs text-center mt-6 border-t border-gray-300 pt-2">
                <p className="italic mb-1">Method: Col - Colorimetry, Gia - Glucose Oxidase, Ink - Kinetic, Imm - Immunology</p>
                <p className="font-bold">Routine reports will be available between 6 to 9 pm</p>
                <div className="mt-2 border-t-2 border-black pt-2 font-bold text-center text-sm">
                    Download your reports by clicking on the link in &apos;report ready&apos; SMS
                    <br />
                    DAY & NIGHT SUNDAY Lab will be open till 1 pm.
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: A4 portrait; }
                    body { -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:w-full { width: 100% !important; }
                    .print\\:max-w-none { max-width: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    
                    /* Hide everything else */
                    nav, aside, header, footer, .sidebar, .no-print { display: none !important; }
                    
                    /* Typography for dot matrix feel */
                    * { font-family: 'Courier New', Courier, monospace !important; color: black !important; }
                    h1, h2, h3, .font-bold { font-weight: 900 !important; }
                }
            `}</style>
        </div>
    );
}
