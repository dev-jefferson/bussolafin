"use client";

import { use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetSummaryCard } from "@/features/budgets/components/BudgetSummaryCard";
import { useBudget } from "@/features/budgets/hooks";
import { CategoryBreakdownChart } from "@/features/expenses/components/CategoryBreakdownChart";
import { ExpenseTable } from "@/features/expenses/components/ExpenseTable";
import { IncomeTable } from "@/features/incomes/components/IncomeTable";
import { GenerateRecurringButton } from "@/features/recurring/components/GenerateRecurringButton";
import { formatMonthYear } from "@/lib/format";

export default function BudgetDetailPage({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const { budgetId } = use(params);
  const { data: budget } = useBudget(budgetId);

  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {budget ? formatMonthYear(budget.month, budget.year) : "Orçamento"}
          </h1>
          <p className="text-sm text-muted-foreground">Receitas, despesas e resumo do mês</p>
        </div>
        <GenerateRecurringButton budgetId={budgetId} />
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="incomes">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="grid gap-6 pt-4">
          <BudgetSummaryCard budgetId={budgetId} />
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Gastos por categoria</h2>
            <CategoryBreakdownChart budgetId={budgetId} />
          </div>
        </TabsContent>
        <TabsContent value="incomes" className="pt-4">
          <IncomeTable budgetId={budgetId} />
        </TabsContent>
        <TabsContent value="expenses" className="pt-4">
          <ExpenseTable budgetId={budgetId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
