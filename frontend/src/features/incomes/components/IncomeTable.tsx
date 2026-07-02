"use client";

import { Pencil, Plus, Repeat, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { usePromoteIncomeToRecurring } from "@/features/recurring/hooks";
import type { Income } from "@/types/api";
import { useDeleteIncome, useIncomes } from "../hooks";
import { IncomeForm } from "./IncomeForm";

export function IncomeTable({ budgetId }: { budgetId: string }) {
  const { data: incomes, isPending } = useIncomes(budgetId);
  const deleteIncome = useDeleteIncome(budgetId);
  const promoteToRecurring = usePromoteIncomeToRecurring(budgetId);
  const [editing, setEditing] = useState<Income | null>(null);
  const [creating, setCreating] = useState(false);

  function handleDelete(income: Income) {
    if (!confirm(`Excluir a receita "${income.description}"?`)) return;
    deleteIncome.mutate(income.id, {
      onSuccess: () => toast.success("Receita excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  function handlePromote(income: Income) {
    promoteToRecurring.mutate(income.id, {
      onSuccess: () => toast.success(`"${income.description}" agora é recorrente`),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível marcar como recorrente";
        toast.error(message);
      },
    });
  }

  const total = incomes?.reduce((sum, income) => sum + income.value, 0) ?? 0;

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Nova receita
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova receita</DialogTitle>
            </DialogHeader>
            <IncomeForm budgetId={budgetId} onSuccess={() => setCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Carregando receitas...</p>
      ) : !incomes || incomes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma receita cadastrada ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Dia</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {income.description}
                    {income.recurring && (
                      <Repeat className="size-3.5 text-muted-foreground" aria-label="Recorrente" />
                    )}
                  </span>
                </TableCell>
                <TableCell>{income.day ?? "-"}</TableCell>
                <TableCell className="text-right">{formatCurrency(income.value)}</TableCell>
                <TableCell className="flex justify-end gap-1">
                  {!income.recurring && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Marcar como recorrente"
                      onClick={() => handlePromote(income)}
                    >
                      <Repeat className="size-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setEditing(income)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(income)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{formatCurrency(total)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar receita</DialogTitle>
          </DialogHeader>
          {editing && (
            <IncomeForm budgetId={budgetId} income={editing} onSuccess={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
