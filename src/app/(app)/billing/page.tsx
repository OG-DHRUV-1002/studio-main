import { cookies } from 'next/headers';
import { getAllOrders } from '@/lib/db';
import { getUserContext } from '@/lib/admin-config';
import BillingDashboard from '@/components/billing/billing-dashboard';

import { redirect } from 'next/navigation';

import { AUTH_COOKIE } from '@/lib/constants';

export default async function BillingPage() {
    const cookieStore = await cookies();
    const userUid = cookieStore.get(AUTH_COOKIE)?.value;
    const user = userUid ? getUserContext(userUid) : null;

    const labId = user?.lab_context.id;
    const orders = labId ? await getAllOrders(labId) : [];

    return (
        <div className="h-full w-full bg-gray-50/50">
            <BillingDashboard initialOrders={orders} />
        </div>
    );
}
