'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { cn, downloadFile } from '@/lib/utils'; // Assuming cn utility exists
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';

interface PaymentTerminalProps {
    transaction: Transaction;
    onPaymentModeChange: (mode: 'CASH' | 'online') => void;
    onSimulateSuccess: () => void;
}

export default function PaymentTerminal({ transaction, onPaymentModeChange, onSimulateSuccess }: PaymentTerminalProps) {
    const isOnline = transaction.payment_mode === 'online';
    const isSuccess = transaction.status === 'SUCCESS';
    const isPending = transaction.status === 'PENDING';

    const { user } = useAuth(); // Get lab context for header

    const handleDownloadReceipt = () => {
        // Lab Details Logic (matching InvoicePreview)
        const lab = user?.lab_context;
        const labName = lab?.display_name || "ANVIKSHA";
        const labAddress = lab?.address || ["NL-5/11/03, Sector 11, Nerul (E), Nerul", "Navi Mumbai - 400706."];
        const labEmail = lab?.email || "nirikshapathology.nerul@gmail.com";
        const labPhone = lab?.phone || "98206 40452 / 022-27702853";
        const labWhatsapp = lab?.whatsapp;

        const totalAmount = transaction.amount;
        const formattedDate = transaction.timestamp ? format(new Date(transaction.timestamp), "dd-MMM-yyyy HH:mm") : "-";
        const expectedDate = transaction.timestamp ? format(new Date(new Date(transaction.timestamp).getTime() + 4 * 24 * 60 * 60 * 1000), "dd-MMM-yyyy HH:mm") : "-";

        const receiptHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Receipt-${transaction.invoice_id}</title>
                <style>
                    body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
                    table { border-collapse: collapse; width: 100%; }
                    td, th { padding: 4px; vertical-align: top; }
                    .header { font-size: 14pt; font-weight: bold; }
                    .sub-header { font-size: 10pt; }
                    .bold { font-weight: bold; }
                    .right { text-align: right; }
                    .center { text-align: center; }
                    .border-top { border-top: 1px solid #757575; }
                    .border-bottom { border-bottom: 1px solid #757575; }
                    .dashed-bottom { border-bottom: 1px dashed #cccccc; }
                    .bg-gray { background-color: #f3f4f6; }
                </style>
            </head>
            <body>
                <!-- Header -->
                <table style="margin-bottom: 10px;">
                    <tr>
                        <td style="width: 60%;">
                            <div class="header">${labName}</div>
                            <div class="sub-header">
                                ${labAddress.map(line => `<div>${line}</div>`).join('')}
                            </div>
                        </td>
                        <td style="width: 40%; text-align: right; font-size: 10pt;">
                            <div>Email: ${labEmail}</div>
                            <div>Tel: ${labPhone} ${labWhatsapp ? `| WA: ${labWhatsapp}` : ''}</div>
                        </td>
                    </tr>
                </table>

                 <div style="margin-bottom: 5px;">
                    <span class="bold">${transaction.invoice_id}</span>
                </div>

                <div class="border-top" style="margin-bottom: 5px;"></div>
                
                 <div style="background-color: #f3f4f6; padding: 5px; text-align: center; margin-bottom: 5px;">
                    <span class="bold" style="font-size: 12pt;">BILL</span>
                </div>

                <div class="border-top" style="margin-bottom: 10px;"></div>

                <!-- Patient Grid -->
                <table style="margin-bottom: 10px; font-size: 10pt;">
                    <tr>
                        <!-- Left Col -->
                        <td style="width: 50%;">
                            <table style="width: 100%;">
                                <tr><td style="width: 80px;" class="bold">Name</td><td>: <span style="text-transform: uppercase;">${transaction.patient_name}</span></td></tr>
                                <tr><td class="bold">Age</td><td>: ${transaction.age} Yrs</td></tr>
                                <tr><td class="bold">Contact No</td><td>: ${transaction.mobile || ""}</td></tr>
                                <tr><td class="bold">Ref By</td><td>: <span style="text-transform: uppercase;">${transaction.ref_doctor || "V. V."}</span></td></tr>
                            </table>
                        </td>
                        <!-- Right Col -->
                        <td style="width: 50%;">
                             <table style="width: 100%;">
                                <tr><td style="width: 100px;" class="bold">LabId / Date</td><td>: ${transaction.invoice_id} / ${formattedDate}</td></tr>
                                <tr><td class="bold">Gender</td><td>: ${transaction.gender}</td></tr>
                                <tr><td class="bold">Email</td><td>: ${(transaction as any).email || ""}</td></tr>
                                <tr><td class="bold">Expected Report</td><td>: ${expectedDate}</td></tr>
                            </table>
                        </td>
                    </tr>
                </table>

                 <div class="border-top" style="margin-bottom: 5px;"></div>

                <!-- Items Table Header -->
                <table class="bg-gray" style="font-size: 10pt; font-weight: bold; padding: 5px;">
                    <tr>
                        <td style="width: 50%; padding-left: 5px;">Test Name</td>
                        <td style="width: 25%; text-align: center;">Remarks</td>
                        <td style="width: 25%; text-align: right; padding-right: 5px;">MRP Amount</td>
                    </tr>
                </table>

                <div class="border-top" style="margin-bottom: 10px;"></div>

                <!-- Items -->
                <table style="font-size: 10pt; margin-bottom: 15px;">
                     ${transaction.items.map(item => `
                        <tr>
                            <td class="dashed-bottom" style="width: 50%; padding: 5px;">${item.test_name}</td>
                            <td class="dashed-bottom" style="width: 25%; text-align: center;"></td>
                            <td class="dashed-bottom" style="width: 25%; text-align: right; padding: 5px;">${item.price.toFixed(2)}</td>
                        </tr>
                     `).join('')}
                </table>

                 <div class="border-top" style="margin-bottom: 10px;"></div>

                <!-- Footer Total -->
                <table style="font-size: 11pt;">
                    <tr>
                        <td style="width: 60%;"></td>
                        <td class="right bold" style="width: 20%;">Bill Amount</td>
                        <td class="right bold" style="width: 20%;">${totalAmount.toFixed(2)}</td>
                    </tr>
                </table>

                ${transaction.lab_id === 'lab_001_bhonsle' ? `
                <div style="margin-top: 50px; text-align: right;">
                    <div style="height: 60px;"></div> <!-- Space for Stamp -->
                    <div class="bold" style="font-size: 11pt;">Dr. S.T. Bhonsle</div>
                    <div class="bold" style="font-size: 10pt;">MD, DPB</div>
                </div>
                ` : ''}

                <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 9pt; text-align: center; color: #666;">
                     <p>Electronic Receipt generated on ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;

        const dataUri = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(receiptHtml);
        downloadFile(dataUri, `Receipt-${transaction.invoice_id}.doc`);
    };

    return (
        <Card className="h-full border-l rounded-none shadow-none bg-gray-50 flex flex-col no-print">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Payment Terminal</span>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isSuccess ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                        {transaction.status}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">

                {/* Amount Display */}
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-1 uppercase tracking-wider text-xs">Total Payable</p>
                    <h2 className="text-5xl font-black text-gray-900">₹{transaction.amount}</h2>
                </div>

                {/* Payment Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg mb-6">
                    <button
                        onClick={() => onPaymentModeChange('CASH')}
                        className={cn(
                            "py-2 rounded-md text-sm font-bold transition-all",
                            !isOnline ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"
                        )}
                    >
                        CASH
                    </button>
                    <button
                        onClick={() => onPaymentModeChange('online')}
                        className={cn(
                            "py-2 rounded-md text-sm font-bold transition-all",
                            isOnline ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-black"
                        )}
                    >
                        QR / UPI
                    </button>
                </div>

                {/* QR Zone */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl bg-white relative overflow-hidden transition-all">

                    {isSuccess ? (
                        <div className="text-center animate-in zoom-in duration-300">
                            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-700">Payment Received!</h3>
                            <p className="text-gray-500 mt-2">Transaction ID: {transaction.invoice_id}</p>
                        </div>
                    ) : isOnline ? (
                        <>
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <QRCodeCanvas
                                    value={transaction.qr_string || ""}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>
                            <div className="mt-6 text-center space-y-2">
                                <div className="flex items-center justify-center gap-2 text-blue-600 font-medium animate-pulse">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Waiting for payment...</span>
                                </div>
                                <p className="text-xs text-gray-400">Scan using any UPI App</p>

                                <Button size="sm" variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={onSimulateSuccess}>
                                    Payment Received
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-400">
                            <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                                <span className="text-2xl">💵</span>
                            </div>
                            <p>Collect <b>₹{transaction.amount}</b> Cash</p>
                            <Button className="mt-4" onClick={onSimulateSuccess}>
                                Mark as Collected
                            </Button>
                        </div>
                    )}
                </div>

                {/* Print Action */}
                <div className="mt-6">
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold"
                        disabled={!isSuccess}
                        onClick={handleDownloadReceipt}
                    >
                        {/* Print Receipt -> Download Receipt */}
                        Download Receipt
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
