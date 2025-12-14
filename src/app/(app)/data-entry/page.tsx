
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrders } from "@/lib/actions";
import Link from 'next/link';

export default async function DataEntryPage() {
    const allOrders = await getOrders();
    const pendingOrders = allOrders
        .filter(order => order.status === 'Pending')
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return (
        <>
            <AppHeader title="Data Entry" />
            <main className="flex-1 p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Orders</CardTitle>
                        <CardDescription>Select an order to enter test results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pendingOrders.length > 0 ? (
                            <ul className="space-y-2">
                                {pendingOrders.map(order => (
                                    <li key={order.orderId}>
                                        <Link href={`/orders/${order.orderId}/entry`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{order.orderId} - {order.patient?.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">₹{order.finalAmount.toFixed(2)}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">{order.labType}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No pending orders requiring data entry.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
