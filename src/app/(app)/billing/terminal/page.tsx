'use client';

import React, { Suspense } from 'react';
import TransactionTerminal from '@/components/billing/transaction-terminal';
import { Loader2 } from 'lucide-react';

export default function TerminalPage() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <TransactionTerminal />
        </Suspense>
    );
}
