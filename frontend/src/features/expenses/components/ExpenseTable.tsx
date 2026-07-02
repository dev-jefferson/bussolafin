"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/types/api";
import { useDeleteExpense, useExpenses } from "../hooks";
import { ExpenseForm } from "./ExpenseForm";

export function ExpenseTable({ budgetId }: { budgetId: string }) {
  const { data: expenses, isPending } = useExpenses(budgetId);
  const deleteExpense = useDeleteExpense(budgetId);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);

  function handleDelete(expense: Expense) {
    if (!confirm(`Excluir a despesa de "${expense.category.name}"?`)) return;
    deleteExpense.mutate(expense.id, {
      onSuccess: () => toast.success("Despesa excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  const total = expenses?.reduce((sum, expense) => sum + expense.value, 0) ?? 0;

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
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ajustado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {expense.category.name}
                    {expense.category.adjustable && <Badge variant="secondary">Ajustável</Badge>}
                  </span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(expense.value)}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {expense.simulatedValue != null ? formatCurrency(expense.simulatedValue) : "-"}
                </TableCell>
                <TableCell className="flex justify-end gap-1">
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
              <TableCell className="text-right">{formatCurrency(total)}</TableCell>
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
