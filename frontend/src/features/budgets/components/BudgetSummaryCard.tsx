"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { useBudgetSummary } from "../hooks";

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{formatCurrency(value)}</p>
      </CardContent>
    </Card>
  );
}

export function BudgetSummaryCard({
  budgetId,
  simulated,
}: {
  budgetId: string;
  simulated: boolean;
}) {
  const { data: summary, isPending } = useBudgetSummary(budgetId);

  if (isPending || !summary) {
    return <p className="text-sm text-muted-foreground">Carregando resumo...</p>;
  }

  // Gastos e Gastos ajustados são fixos (fatos do mês, com e sem as simulações
  // aplicadas) - só Economia alterna, comparando as duas colunas conforme o toggle.
  const economia = simulated ? summary.economiaSimulada : summary.economia;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Renda total" value={summary.totalIncome} />
      <StatCard label="Gastos" value={summary.totalExpenses} />
      <StatCard label="Gastos ajustados" value={summary.totalExpensesSimulated} />
      <StatCard
        label={simulated ? "Economia (simulada)" : "Economia"}
        value={economia}
        highlight={simulated}
      />
    </div>
  );
}
