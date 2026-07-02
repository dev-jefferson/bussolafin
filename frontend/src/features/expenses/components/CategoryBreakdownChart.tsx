"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import { useExpensesByCategory } from "../hooks";

const ADJUSTABLE_COLOR = "var(--chart-1)";
const FIXED_COLOR = "var(--chart-muted)";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { categoryName: string; adjustable: boolean; value: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-sm">
      <p className="font-medium">{item.categoryName}</p>
      <p className="text-muted-foreground">{item.adjustable ? "Ajustável" : "Fixo"}</p>
      <p className="mt-1 font-medium">{formatCurrency(item.value)}</p>
    </div>
  );
}

export function CategoryBreakdownChart({ budgetId }: { budgetId: string }) {
  const { data: breakdown, isPending } = useExpensesByCategory(budgetId);
  const [simulated, setSimulated] = useState(false);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando gastos por categoria...</p>;
  }

  if (!breakdown || breakdown.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>;
  }

  const data = breakdown
    .map((item) => ({
      categoryName: item.categoryName,
      adjustable: item.adjustable,
      value: simulated ? item.totalSimulated : item.total,
    }))
    .sort((a, b) => b.value - a.value);

  const rowHeight = 32;

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: ADJUSTABLE_COLOR }} />
            Ajustável
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: FIXED_COLOR }} />
            Fixo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="breakdown-simulate" checked={simulated} onCheckedChange={setSimulated} />
          <Label htmlFor="breakdown-simulate" className="text-xs">
            Simular gasto ajustado
          </Label>
        </div>
      </div>
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell
                key={entry.categoryName}
                fill={entry.adjustable ? ADJUSTABLE_COLOR : FIXED_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
