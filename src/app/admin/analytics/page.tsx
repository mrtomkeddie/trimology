'use client';

import * as React from 'react';
import { getAllBookings, getLocations } from "@/lib/data";
import { ArrowLeft, Loader2, ShieldAlert, DollarSign, CalendarCheck2, Users, LineChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Booking, Location } from '@/lib/types';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/components/revenue-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

type AnalyticsData = {
    totalRevenue: number;
    totalBookings: number;
    uniqueCustomers: number;
    chartData: { date: string; revenue: number }[];
}

export default function AnalyticsPage() {
    const { adminUser } = useAdmin();
    const [allBookings, setAllBookings] = React.useState<Booking[]>([]);
    const [locations, setLocations] = React.useState<Location[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = React.useState<string>('all');

    const fetchData = React.useCallback(async () => {
        if (!adminUser) return;
        setLoading(true);
        setError(null);
        try {
            const [fetchedBookings, fetchedLocations] = await Promise.all([
                getAllBookings(adminUser.locationId),
                getLocations(adminUser.locationId),
            ]);
            setAllBookings(fetchedBookings);
            setLocations(fetchedLocations);
        } catch (e) {
            setError("Failed to fetch analytics data. Please try refreshing the page.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [adminUser]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const analyticsData = React.useMemo<AnalyticsData>(() => {
        const today = new Date();
        const last7Days = { start: startOfDay(subDays(today, 6)), end: endOfDay(today) };
        
        const filteredBookings = allBookings.filter(b => 
            (selectedLocation === 'all' || b.locationId === selectedLocation) &&
            isWithinInterval(new Date(b.bookingTimestamp), last7Days)
        );

        const totalRevenue = filteredBookings.reduce((acc, b) => acc + b.servicePrice, 0);
        const totalBookings = filteredBookings.length;
        const uniqueCustomers = new Set(filteredBookings.map(b => b.clientPhone)).size;

        const dailyRevenue: { [key: string]: number } = {};
        for (let i = 0; i < 7; i++) {
            const date = startOfDay(subDays(today, i));
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyRevenue[dateString] = 0;
        }

        filteredBookings.forEach(booking => {
            const date = new Date(booking.bookingTimestamp);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dailyRevenue.hasOwnProperty(dateString)) {
                dailyRevenue[dateString] += booking.servicePrice;
            }
        });

        const chartData = Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date, revenue }))
            .reverse();
        
        return { totalRevenue, totalBookings, uniqueCustomers, chartData };
    }, [allBookings, selectedLocation]);

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-center p-4">
                <div>
                    <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={fetchData}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                 <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="h-8 w-8">
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Admin</span>
                        </Link>
                    </Button>
                    <h1 className="font-headline text-xl font-semibold">Analytics Dashboard</h1>
                 </div>
                  {locations.length > 1 && (
                     <div className="w-full max-w-xs">
                        <Select onValueChange={setSelectedLocation} value={selectedLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by location..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {locations.map(location => (
                                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Last 7 Days Performance</h2>
                    <p className="text-muted-foreground">Metrics are calculated based on bookings within the last 7 days.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">£{analyticsData.totalRevenue.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analyticsData.totalBookings}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analyticsData.uniqueCustomers}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" /> Daily Revenue (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueChart data={analyticsData.chartData} />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
