
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from 'lucide-react';
import type { TestOrder } from "@/lib/types";
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
  const [activeTab, setActiveTab] = useState('in-house');

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  const { toast } = useToast();

  useEffect(() => {
    document.body.classList.remove('theme-outside');
    if (activeTab === 'outside') {
      document.body.classList.add('theme-outside');
    }
    return () => {
      document.body.classList.remove('theme-outside');
    };
  }, [activeTab]);

  // Reset filters when changing tabs
  useEffect(() => {
    setSelectedMonth('all');
    setSelectedDoctor('all');
  }, [activeTab]);

  const currentOrders = activeTab === 'in-house' ? inHouseOrders : outsideOrders;

  // Extract unique doctors for the dropdown
  const uniqueDoctors = useMemo(() => {
    const doctors = new Set(currentOrders.map(o => o.referredBy || 'Self').filter(d => d !== 'Self' && d !== 'N/A'));
    return Array.from(doctors).sort();
  }, [currentOrders]);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return currentOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const matchesMonth = selectedMonth === 'all' || orderDate.getMonth().toString() === selectedMonth;
      const matchesDoctor = selectedDoctor === 'all' || (order.referredBy || 'Self') === selectedDoctor;
      return matchesMonth && matchesDoctor;
    });
  }, [currentOrders, selectedMonth, selectedDoctor]);


  const handleClientExport = () => {
    try {
      setLoadingExport(activeTab as 'in-house' | 'outside');

      if (filteredOrders.length === 0) {
        toast({ title: "Export Failed", description: "No data to export with current filters.", variant: 'destructive' });
        setLoadingExport(null);
        return;
      }

      const headers = ['Order ID', 'Patient Name', 'Order Date', 'Recieved From (Dr.)', 'Status', 'Lab Type', 'Final Amount', 'Tests'];
      const rows = filteredOrders.map(order => [
        order.orderId,
        order.patient?.fullName || 'N/A',
        format(new Date(order.orderDate), 'dd/MM/yyyy'),
        order.referredBy || 'Self',
        order.status,
        order.labType,
        order.finalAmount.toFixed(2),
        order.tests.map(t => t.testName).join(', ')
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
      });

      downloadFile(`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`, `labwise_export_${activeTab}_${selectedMonth !== 'all' ? `month${selectedMonth}_` : ''}${selectedDoctor !== 'all' ? 'filtered_' : ''}${new Date().toISOString().split('T')[0]}.csv`);

      toast({ title: "Export Successful", description: `Exported ${filteredOrders.length} records.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Export Failed", description: "An error occurred during export.", variant: 'destructive' });
    } finally {
      setLoadingExport(null);
    }
  };

  const Filters = () => (
    <div className="flex gap-4 mb-4">
      <div className="w-[200px]">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {format(new Date(2024, i, 1), 'MMMM')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[200px]">
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {uniqueDoctors.map(dr => (
              <SelectItem key={dr} value={dr}>{dr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const OrdersTable = ({ orders }: { orders: TestOrder[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Ref. By</TableHead>
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
            <TableCell>{order.referredBy || 'Self'}</TableCell>
            <TableCell>
              <Badge variant="outline" className={`
                ${order.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  order.status === 'Payment Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'}
              `}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">₹{order.finalAmount.toFixed(2)}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
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
              <Button onClick={handleClientExport} disabled={loadingExport === 'in-house'}>
                {loadingExport === 'in-house' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Filters />
              <OrdersTable orders={filteredOrders} />
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
              <Button onClick={handleClientExport} disabled={loadingExport === 'outside'}>
                {loadingExport === 'outside' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Filters />
              <OrdersTable orders={filteredOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
