"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type StaffPerformanceChartProps = {
  data: { name: string, bookings: number }[]
}

export function StaffPerformanceChart({ data }: StaffPerformanceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center">
                <p className="text-muted-foreground">No staff booking data for this period.</p>
            </div>
        )
    }
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data}
        layout="vertical"
        margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} horizontal={false} />
        <XAxis
          type="number"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
            contentStyle={{ 
                background: "hsl(var(--background))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
            }}
            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
        />
        <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
