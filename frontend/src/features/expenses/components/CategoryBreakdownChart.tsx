"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import { useExpensesByCategory } from "../hooks";

const BAR_COLOR = "var(--chart-1)";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { categoryName: string; value: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-sm">
      <p className="font-medium">{item.categoryName}</p>
      <p className="mt-1 font-medium">{formatCurrency(item.value)}</p>
    </div>
  );
}

export function CategoryBreakdownChart({
  budgetId,
  simulated,
}: {
  budgetId: string;
  simulated: boolean;
}) {
  const { data: breakdown, isPending } = useExpensesByCategory(budgetId);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando gastos por categoria...</p>;
  }

  if (!breakdown || breakdown.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>;
  }

  const data = breakdown
    .map((item) => ({
      categoryName: item.categoryName,
      value: simulated ? item.totalSimulated : item.total,
    }))
    .sort((a, b) => b.value - a.value);

  const rowHeight = 32;

  return (
    <div className="grid gap-3">
      <ResponsiveContainer width="100%" height={Math.max(data.length * rowHeight, 120)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis
            type="number"
            tickFormatter={(value: number) => formatCurrency(value)}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            type="category"
            dataKey="categoryName"
            width={110}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24} fill={BAR_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
