
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type RevenueChartProps = {
  data: { date: string, revenue: number }[]
  onBarClick?: (payload: any) => void;
}

export function RevenueChart({ data, onBarClick }: RevenueChartProps) {
  const chartStyle = onBarClick ? { cursor: 'pointer' } : {};
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} onClick={onBarClick} style={chartStyle}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `£${value}`}
        />
        <Tooltip
            contentStyle={{ 
                background: "hsl(var(--background))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
            }}
            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
