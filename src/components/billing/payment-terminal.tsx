'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface PaymentTerminalProps {
    transaction: Transaction;
    onPaymentModeChange: (mode: 'CASH' | 'online') => void;
    onSimulateSuccess: () => void;
}

export default function PaymentTerminal({ transaction, onPaymentModeChange, onSimulateSuccess }: PaymentTerminalProps) {
    const isOnline = transaction.payment_mode === 'online';
    const isSuccess = transaction.status === 'SUCCESS';
    const isPending = transaction.status === 'PENDING';

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

                                <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={onSimulateSuccess}>
                                    Simulate Received (Dev)
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
                        onClick={() => window.print()}
                    >
                        Print Receipt
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
