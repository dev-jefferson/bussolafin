"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecurringExpenseForm } from "@/features/recurring/components/RecurringExpenseForm";
import { RecurringExpenseList } from "@/features/recurring/components/RecurringExpenseList";
import { RecurringIncomeForm } from "@/features/recurring/components/RecurringIncomeForm";
import { RecurringIncomeList } from "@/features/recurring/components/RecurringIncomeList";

export default function RecurringPage() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Recorrências</h1>
        <p className="text-sm text-muted-foreground">
          Despesas e receitas que se repetem todo mês — gere-as dentro de um orçamento sem
          precisar redigitar
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Despesas recorrentes</h2>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="size-4" />
              Nova despesa recorrente
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova despesa recorrente</DialogTitle>
              </DialogHeader>
              <RecurringExpenseForm onSuccess={() => setExpenseDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <RecurringExpenseList />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Receitas recorrentes</h2>
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="size-4" />
              Nova receita recorrente
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova receita recorrente</DialogTitle>
              </DialogHeader>
              <RecurringIncomeForm onSuccess={() => setIncomeDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <RecurringIncomeList />
      </div>
    </div>
  );
}
