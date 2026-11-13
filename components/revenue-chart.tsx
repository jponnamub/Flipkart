"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#revenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
