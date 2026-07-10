"use client";

import { ChevronDown, ChevronRight, Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
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
import type { Expense } from "@/types/api";
import { useDeleteExpense, useExpenses, useSetExpensePaid } from "../hooks";
import { getItemStatus, STATUS_LABELS, STATUS_STYLES } from "../status";
import { ExpenseEntryList } from "./ExpenseEntryList";
import { ExpenseForm } from "./ExpenseForm";

export function ExpenseTable({ budgetId }: { budgetId: string }) {
  const { data: expenses, isPending } = useExpenses(budgetId);
  const { data: budget } = useBudget(budgetId);
  const deleteExpense = useDeleteExpense(budgetId);
  const setExpensePaid = useSetExpensePaid(budgetId);
  const promoteToRecurring = usePromoteExpenseToRecurring(budgetId);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(expenseId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(expenseId)) {
        next.delete(expenseId);
      } else {
        next.add(expenseId);
      }
      return next;
    });
  }

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
  const paidCount = sortedExpenses.filter((expense) => expense.paid).length;
  const totalPaid = sortedExpenses
    .filter((expense) => expense.paid)
    .reduce((sum, expense) => sum + expense.value, 0);
  const totalToPay = total - totalPaid;

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
        <>
          <div className="rounded-md border p-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
                Pago: {formatCurrency(totalPaid)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="inline-block size-2.5 rounded-full bg-amber-500" />
                A pagar: {formatCurrency(totalToPay)}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              Total do mês: {formatCurrency(total)} · {paidCount} de {sortedExpenses.length} despesas pagas
            </p>
          </div>
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
            {sortedExpenses.map((expense) => {
              const status = getItemStatus(expense, budget);
              const isExpanded = expandedIds.has(expense.id);
              return (
                <Fragment key={expense.id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="-ml-2"
                          onClick={() => toggleExpanded(expense.id)}
                          title="Ver lançamentos"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
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
                      <Badge
                        className={cn("cursor-pointer border-0", STATUS_STYLES[status])}
                        onClick={() => handleTogglePaid(expense)}
                        title="Clique para marcar como pago/não pago"
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
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
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <ExpenseEntryList budgetId={budgetId} expense={expense} budget={budget} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
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
        </>
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
