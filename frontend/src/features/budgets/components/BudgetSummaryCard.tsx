"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import { useBudgetSummary } from "../hooks";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(value)}</p>
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

  const totalExpenses = simulated ? summary.totalExpensesSimulated : summary.totalExpenses;
  const totalAdjustable = simulated ? summary.totalAdjustableSimulated : summary.totalAdjustable;
  const economia = simulated ? summary.economiaSimulada : summary.economia;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Switch id="simulate" checked={simulated} onCheckedChange={setSimulated} />
        <Label htmlFor="simulate">Simular gasto ajustado</Label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Renda total" value={summary.totalIncome} />
        <StatCard label="Gastos" value={totalExpenses} />
        <StatCard label="Ajustes (gastos ajustáveis)" value={totalAdjustable} />
        <StatCard label="Economia" value={economia} />
      </div>
    </div>
  );
}
