
'use client';

import * as React from 'react';
import { getAllBookings, getLocations, getStaff } from "@/lib/data";
import { ArrowLeft, Loader2, ShieldAlert, DollarSign, CalendarCheck2, Users, LineChart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Booking, Location, Staff } from '@/lib/types';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChart } from '@/components/revenue-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, startOfDay, endOfDay, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { StaffPerformanceChart } from '@/components/staff-performance-chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type StaffPerformanceData = {
    name: string;
    bookings: number;
}

type AnalyticsData = {
    totalRevenue: number;
    totalBookings: number;
    uniqueCustomers: number;
    chartData: { date: string; revenue: number }[];
    staffPerformance: StaffPerformanceData[];
}

export default function AnalyticsPage() {
    const { adminUser } = useAdmin();
    const [allBookings, setAllBookings] = React.useState<Booking[]>([]);
    const [locations, setLocations] = React.useState<Location[]>([]);
    const [staff, setStaff] = React.useState<Staff[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = React.useState<string>('all');
    const [timeframe, setTimeframe] = React.useState<'7days' | 'monthly'>('7days');
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const fetchData = React.useCallback(async () => {
        if (!adminUser) return;
        setLoading(true);
setError(null);
        try {
            const [fetchedBookings, fetchedLocations, fetchedStaff] = await Promise.all([
                getAllBookings(adminUser.locationId),
                getLocations(adminUser.locationId),
                getStaff(adminUser.locationId),
            ]);
            setAllBookings(fetchedBookings);
            setLocations(fetchedLocations);
            setStaff(fetchedStaff);
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
        let interval: Interval;

        if (timeframe === '7days') {
            interval = { start: startOfDay(subDays(today, 6)), end: endOfDay(today) };
        } else {
            interval = { start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) };
        }
        
        const filteredBookings = allBookings.filter(b => 
            (selectedLocation === 'all' || b.locationId === selectedLocation) &&
            isWithinInterval(new Date(b.bookingTimestamp), interval)
        );

        const totalRevenue = filteredBookings.reduce((acc, b) => acc + b.servicePrice, 0);
        const totalBookings = filteredBookings.length;
        const uniqueCustomers = new Set(filteredBookings.map(b => b.clientPhone)).size;
        
        const staffBookingCounts: Record<string, number> = {};
        staff.forEach(s => {
             if (selectedLocation === 'all' || s.locationId === selectedLocation) {
                staffBookingCounts[s.name] = 0;
            }
        });

        const dailyRevenue: { [key: string]: number } = {};
        const daysInInterval = eachDayOfInterval(interval);

        daysInInterval.forEach(day => {
            const dateString = format(day, 'MMM d');
            dailyRevenue[dateString] = 0;
        });

        filteredBookings.forEach(booking => {
            const date = new Date(booking.bookingTimestamp);
            const dateString = format(date, 'MMM d');
            if (dailyRevenue.hasOwnProperty(dateString)) {
                dailyRevenue[dateString] += booking.servicePrice;
            }
            if (booking.staffName && staffBookingCounts.hasOwnProperty(booking.staffName)) {
                staffBookingCounts[booking.staffName]++;
            }
        });

        const chartData = Object.entries(dailyRevenue)
            .map(([date, revenue]) => ({ date, revenue }))
        
        const staffPerformance = Object.entries(staffBookingCounts)
            .map(([name, bookings]) => ({ name, bookings }))
            .sort((a, b) => b.bookings - a.bookings);
        
        return { totalRevenue, totalBookings, uniqueCustomers, chartData, staffPerformance };
    }, [allBookings, selectedLocation, staff, timeframe, currentMonth]);

    const handlePreviousMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    const isNextMonthDisabled = isSameMonth(currentMonth, new Date());


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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                    <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as '7days' | 'monthly')}>
                        <TabsList>
                            <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {timeframe === 'monthly' && (
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-md">
                            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold w-32 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
                            <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={isNextMonthDisabled}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
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
                 <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChart className="h-5 w-5" /> 
                                {timeframe === '7days' ? 'Daily Revenue' : 'Revenue for ' + format(currentMonth, 'MMMM')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <RevenueChart data={analyticsData.chartData} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" /> Top Staff by Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                           <StaffPerformanceChart data={analyticsData.staffPerformance} />
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
}

    