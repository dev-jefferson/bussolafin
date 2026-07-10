"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiRequestError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { RecurringExpense } from "@/types/api";
import { useDeleteRecurringExpense, useRecurringExpenses, useUpdateRecurringExpense } from "../hooks";
import { RecurringExpenseForm } from "./RecurringExpenseForm";

export function RecurringExpenseList() {
  const { data: recurringExpenses, isPending } = useRecurringExpenses();
  const updateRecurringExpense = useUpdateRecurringExpense();
  const deleteRecurringExpense = useDeleteRecurringExpense();
  const [editing, setEditing] = useState<RecurringExpense | null>(null);

  function handleToggleActive(item: RecurringExpense, active: boolean) {
    updateRecurringExpense.mutate(
      {
        id: item.id,
        input: {
          description: item.description,
          categoryId: item.category.id,
          day: item.day,
          value: item.value,
          simulatedValue: item.simulatedValue,
          adjustable: item.adjustable,
          active,
        },
      },
      {
        onError: (error) => {
          const message =
            error instanceof ApiRequestError ? error.message : "Não foi possível atualizar";
          toast.error(message);
        },
      }
    );
  }

  function handleDelete(item: RecurringExpense) {
    if (!confirm(`Excluir a despesa recorrente "${item.description}"?`)) return;
    deleteRecurringExpense.mutate(item.id, {
      onSuccess: () => toast.success("Despesa recorrente excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando despesas recorrentes...</p>;
  }

  if (!recurringExpenses || recurringExpenses.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma despesa recorrente cadastrada ainda.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Dia</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringExpenses.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell className="text-muted-foreground">{item.category.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.day ?? "-"}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
              <TableCell>
                <Switch
                  checked={item.active}
                  onCheckedChange={(checked) => handleToggleActive(item, checked)}
                />
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(item)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item)}>
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar despesa recorrente</DialogTitle>
          </DialogHeader>
          {editing && (
            <RecurringExpenseForm recurringExpense={editing} onSuccess={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
