"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import { useBudgetSummary } from "../hooks";

function StatCard({
  label,
  value,
  secondaryValue,
  highlight,
}: {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(value)}</p>
        {secondaryValue != null && (
          <p className="mt-1 text-sm text-muted-foreground">
            simulado: {formatCurrency(secondaryValue)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function BudgetSummaryCard({ budgetId }: { budgetId: string }) {
  const { data: summary, isPending } = useBudgetSummary(budgetId);
  const [simulated, setSimulated] = useState(false);

  if (isPending || !summary) {
    return <p className="text-sm text-muted-foreground">Carregando resumo...</p>;
  }

  const economia = simulated ? summary.economiaSimulada : summary.economia;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Switch id="simulate" checked={simulated} onCheckedChange={setSimulated} />
        <Label htmlFor="simulate">Simular gasto ajustado</Label>
        <span className="text-sm text-muted-foreground">
          — e se eu fizesse os ajustes que estou considerando?
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Renda total" value={summary.totalIncome} />
        <StatCard
          label="Gastos"
          value={summary.totalExpenses}
          secondaryValue={simulated ? summary.totalExpensesSimulated : undefined}
        />
        <StatCard
          label="Ajustes (gastos ajustáveis)"
          value={summary.totalAdjustable}
          secondaryValue={simulated ? summary.totalAdjustableSimulated : undefined}
        />
        <StatCard
          label={simulated ? "Economia (simulada)" : "Economia"}
          value={economia}
          highlight={simulated}
        />
      </div>
    </div>
  );
}
