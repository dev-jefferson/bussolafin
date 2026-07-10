"use client";

import { Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { useBudget } from "@/features/budgets/hooks";
import { usePromoteExpenseToRecurring } from "@/features/recurring/hooks";
import type { Budget, Expense } from "@/types/api";
import { useDeleteExpense, useExpenses, useSetExpensePaid } from "../hooks";
import { ExpenseForm } from "./ExpenseForm";

type ExpenseStatus = "paid" | "pending" | "overdue";

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  overdue: "bg-red-100 text-red-800 hover:bg-red-200",
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Não pago",
};

function getExpenseStatus(expense: Expense, budget?: Budget): ExpenseStatus {
  if (expense.paid) return "paid";
  if (!budget || expense.day == null) return "pending";
  const dueDate = new Date(budget.year, budget.month - 1, expense.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today ? "overdue" : "pending";
}

export function ExpenseTable({ budgetId }: { budgetId: string }) {
  const { data: expenses, isPending } = useExpenses(budgetId);
  const { data: budget } = useBudget(budgetId);
  const deleteExpense = useDeleteExpense(budgetId);
  const setExpensePaid = useSetExpensePaid(budgetId);
  const promoteToRecurring = usePromoteExpenseToRecurring(budgetId);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);

  function handleTogglePaid(expense: Expense) {
    setExpensePaid.mutate(
      { id: expense.id, paid: !expense.paid },
      {
        onError: (error) => {
          const message =
            error instanceof ApiRequestError ? error.message : "Não foi possível atualizar";
          toast.error(message);
        },
      }
    );
  }

  function handleDelete(expense: Expense) {
    if (!confirm(`Excluir a despesa "${expense.description}"?`)) return;
    deleteExpense.mutate(expense.id, {
      onSuccess: () => toast.success("Despesa excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  function handlePromote(expense: Expense) {
    promoteToRecurring.mutate(expense.id, {
      onSuccess: () => toast.success(`"${expense.description}" agora é recorrente`),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível marcar como recorrente";
        toast.error(message);
      },
    });
  }

  const sortedExpenses = expenses ? [...expenses].sort((a, b) => b.value - a.value) : [];
  const total = sortedExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const totalAjustado = sortedExpenses.reduce(
    (sum, expense) => sum + (expense.adjustable ? expense.simulatedValue ?? expense.value : expense.value),
    0
  );

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Nova despesa
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova despesa</DialogTitle>
            </DialogHeader>
            <ExpenseForm budgetId={budgetId} onSuccess={() => setCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Carregando despesas...</p>
      ) : !expenses || expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Dia</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ajustado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {expense.description}
                    {expense.recurring && (
                      <Repeat className="size-3.5 text-muted-foreground" aria-label="Recorrente" />
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{expense.category.name}</TableCell>
                <TableCell className="text-muted-foreground">{expense.day ?? "-"}</TableCell>
                <TableCell className="text-right">{formatCurrency(expense.value)}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {expense.adjustable && expense.simulatedValue != null
                    ? formatCurrency(expense.simulatedValue)
                    : "-"}
                </TableCell>
                <TableCell>
                  {(() => {
                    const status = getExpenseStatus(expense, budget);
                    return (
                      <Badge
                        className={cn("cursor-pointer border-0", STATUS_STYLES[status])}
                        onClick={() => handleTogglePaid(expense)}
                        title="Clique para marcar como pago/não pago"
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="flex justify-end gap-1">
                  {!expense.recurring && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Marcar como recorrente"
                      onClick={() => handlePromote(expense)}
                    >
                      <Repeat className="size-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing(expense)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(expense)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-right">{formatCurrency(total)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totalAjustado)}</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar despesa</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExpenseForm budgetId={budgetId} expense={editing} onSuccess={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
