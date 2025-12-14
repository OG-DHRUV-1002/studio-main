
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Loader2 } from 'lucide-react';
import type { TestOrder } from "@/lib/types";
import { exportToCsvAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DashboardClientProps {
  inHouseOrders: TestOrder[];
  outsideOrders: TestOrder[];
}

export function DashboardClient({ inHouseOrders, outsideOrders }: DashboardClientProps) {
  const [loadingExport, setLoadingExport] = useState<'in-house' | 'outside' | null>(null);
  const { toast } = useToast();

  const handleExport = async (labType: 'in-house' | 'outside') => {
    setLoadingExport(labType);
    const result = await exportToCsvAction(labType);
    if (result.success && result.data) {
      downloadFile(`data:text/csv;charset=utf-8,${encodeURIComponent(result.data)}`, `labwise_export_${labType}_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: "Export Successful", description: `Data for ${labType} orders has been exported.` });
    } else {
      toast({ title: "Export Failed", description: result.message, variant: 'destructive' });
    }
    setLoadingExport(null);
  };

  const OrdersTable = ({ orders }: { orders: TestOrder[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length > 0 ? orders.map((order) => (
          <TableRow key={order.orderId}>
            <TableCell className="font-medium">
              <Link href={`/orders/${order.orderId}/report`} className="text-primary hover:underline">
                {order.orderId}
              </Link>
            </TableCell>
            <TableCell>{order.patient?.fullName || 'N/A'}</TableCell>
            <TableCell>{format(new Date(order.orderDate), 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <Badge variant={order.status === 'Completed' ? 'secondary' : 'default'} className={order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">₹{order.finalAmount.toFixed(2)}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">No orders found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Tabs defaultValue="in-house">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="in-house">In-House</TabsTrigger>
            <TabsTrigger value="outside">Outside</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="in-house">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>In-House Orders</CardTitle>
                <CardDescription>Tests processed within LabWise facilities.</CardDescription>
              </div>
              <Button onClick={() => handleExport('in-house')} disabled={loadingExport === 'in-house'}>
                {loadingExport === 'in-house' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export to CSV
              </Button>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={inHouseOrders} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outside">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Outside Lab Orders</CardTitle>
                <CardDescription>Tests sent to third-party laboratories.</CardDescription>
              </div>
              <Button onClick={() => handleExport('outside')} disabled={loadingExport === 'outside'}>
                {loadingExport === 'outside' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export to CSV
              </Button>
            </CardHeader>
            <CardContent>
              <OrdersTable orders={outsideOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
