"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { useComparison } from "../hooks";

const SERIES = [
  { key: "totalIncome", label: "Renda", color: "var(--chart-1)" },
  { key: "totalExpenses", label: "Gastos", color: "var(--chart-5)" },
  { key: "economia", label: "Economia", color: "var(--chart-good)" },
] as const;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-sm">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span className="inline-block size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function MonthComparisonChart() {
  const { data: comparison, isPending } = useComparison(6);
  const [simulated, setSimulated] = useState(false);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando comparativo...</p>;
  }

  if (!comparison || comparison.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum orçamento cadastrado ainda.</p>;
  }

  const data = comparison.map((item) => ({
    label: formatMonthYear(item.month, item.year),
    totalIncome: item.totalIncome,
    totalExpenses: simulated ? item.totalExpensesSimulated : item.totalExpenses,
    economia: simulated ? item.economiaSimulada : item.economia,
  }));

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {SERIES.map((series) => (
            <span key={series.key} className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Switch id="comparison-simulate" checked={simulated} onCheckedChange={setSimulated} />
          <Label htmlFor="comparison-simulate" className="text-xs">
            Simular gasto ajustado
          </Label>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip content={<ChartTooltip />} />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              dot={{ r: 4, fill: series.color, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
