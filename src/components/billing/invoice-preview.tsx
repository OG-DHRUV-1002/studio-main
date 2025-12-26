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

    const labAddress = lab?.address || ["NL-5/11/03, Sector 11, Nerul (E), Nerul", "Navi Mumbai - 400706."];
    const labEmail = lab?.email || "nirikshapathology.nerul@gmail.com";
    const labPhone = lab?.phone || "98206 40452 / 022-27702853";
    const labWhatsapp = lab?.whatsapp;

    const totalAmount = transaction.amount;
    const paidAmount = transaction.status === 'SUCCESS' ? totalAmount : 0;
    const balanceAmount = totalAmount - paidAmount;

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto text-black font-sans text-sm leading-tight relative shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0">
            {/* Header - Preserved as requested */}
            <div className="flex justify-between items-start border-b-[1px] border-black pb-2 mb-2">
                <div className="w-[60%]">
                    <h1 className="text-2xl font-bold">{labName}</h1>
                    <div className="text-xs mt-1">
                        {labAddress.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
                <div className="w-[40%] text-right text-xs">
                    {/* Placeholder removed */}
                </div>
            </div>

            {/* Actually, looking at image:
               Header: 
                 Dr. Bhonsle's laboratory (Bold)
                 Address...
               
               Then TLE0172 (Left aligned)
               Then Line
               Then Bill (Right/Center)
               Then Line
            */}

            <div className="mb-2">
                <p className="font-bold text-sm">{transaction.invoice_id}</p>
            </div>

            <div className="border-t border-black mb-1"></div>

            <div className="flex justify-end items-center mb-1 bg-gray-100 py-1 px-4">
                <h2 className="font-bold text-md pl-4 w-full text-center">Bill</h2>
            </div>

            <div className="border-t border-black mb-2"></div>

            {/* Patient Info Grid - Matching Image */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-2 text-sm font-medium">
                {/* Left Column */}
                <div className="space-y-1">
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Name</span>
                        <span className="uppercase">: {transaction.patient_name}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Age</span>
                        <span>: {transaction.age} Yrs</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Contact No</span>
                        <span>: {transaction.mobile || ""}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-bold">Ref By</span>
                        <span className="uppercase">: {transaction.ref_doctor || "V. V."}</span>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-1">
                    <div className="grid grid-cols-[110px_1fr]">
                        <span className="font-bold">LabId / Date</span>
                        <span>: {transaction.invoice_id} / {format(new Date(transaction.timestamp), "dd-MMM-yyyy HH:mm")}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                        <span className="font-bold">Gender</span>
                        <span>: {transaction.gender}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                        <span className="font-bold">Email</span>
                        <span>: {(transaction as any).email || ""}</span>
                    </div>
                    <div className="grid grid-cols-[110px_1fr]">
                        <span className="font-bold">Expected Report</span>
                        <span>: {format(new Date(new Date(transaction.timestamp).getTime() + 4 * 24 * 60 * 60 * 1000), "dd-MMM-yyyy HH:mm")}</span> {/* Hardcoded +4 days to match style broadly */}
                    </div>
                </div>
            </div>

            <div className="border-t border-black mb-2"></div>

            {/* Items Table Headers */}
            <div className="grid grid-cols-[1fr_150px_150px] font-bold text-sm mb-1 px-1 bg-gray-100/50">
                <div>Test Name</div>
                <div className="text-center">Remarks</div>
                <div className="text-right">MRP Amount</div>
            </div>

            <div className="border-t border-black mb-2"></div>

            {/* Items Table Body */}
            <div className="mb-4 min-h-[300px]">
                {transaction.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_150px_150px] text-sm py-1 border-b border-gray-200 border-dashed px-1">
                        <div>{item.test_name}</div>
                        <div className="text-center"></div> {/* Remarks empty for now */}
                        <div className="text-right">{item.price.toFixed(2)}</div>
                    </div>
                ))}
            </div>

            <div className="border-t border-black mb-2"></div>

            {/* Footer - Only Bill Amount */}
            <div className="flex justify-end items-center pt-2">
                <div className="w-[300px] flex justify-between font-bold text-sm px-1">
                    <span>Bill Amount</span>
                    <span>{totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Signature Footer for Lab 1 */}
            {transaction.lab_id === 'lab_001_bhonsle' && (
                <div className="mt-12 flex justify-end">
                    <div className="text-right">
                        <div className="h-16"></div> {/* Space for Stamp/Sign */}
                        <p className="font-bold text-md">Dr. S.T. Bhonsle</p>
                        <p className="font-bold text-sm">MD, DPB</p>
                    </div>
                </div>
            )}

            <div className="text-xs text-center mt-6 border-t border-gray-300 pt-2 hidden print:block">
                {/* Footer content if needed, kept minimal as per image which cuts off */}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: A4 portrait; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
