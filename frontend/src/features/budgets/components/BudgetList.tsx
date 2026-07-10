"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { ApiRequestError } from "@/lib/api-client";
import type { Budget } from "@/types/api";
import { useBudgets, useDeleteBudget } from "../hooks";
import { BudgetForm } from "./BudgetForm";
import { PreviousBalanceSyncNotice } from "./PreviousBalanceSyncNotice";

export function BudgetList() {
  const { data: budgets, isPending } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const [editing, setEditing] = useState<Budget | null>(null);

  function handleDelete(id: string, label: string) {
    if (!confirm(`Excluir o orçamento de ${label}? Isso remove receitas e despesas associadas.`)) return;
    deleteBudget.mutate(id, {
      onSuccess: () => toast.success("Orçamento excluído"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando orçamentos...</p>;
  }

  if (!budgets || budgets.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum orçamento cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const label = formatMonthYear(budget.month, budget.year);
        return (
          <Card key={budget.id} className="relative">
            <CardHeader>
              <CardTitle>
                <Link href={`/budgets/${budget.id}`} className="hover:underline">
                  {label}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Sobra anterior: {formatCurrency(budget.previousBalance)}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing(budget)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(budget.id, label)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <PreviousBalanceSyncNotice budget={budget} />
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar orçamento</DialogTitle>
          </DialogHeader>
          {editing && <BudgetForm budget={editing} onSuccess={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
