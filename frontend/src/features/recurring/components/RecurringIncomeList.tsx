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
import type { RecurringIncome } from "@/types/api";
import { useDeleteRecurringIncome, useRecurringIncomes, useUpdateRecurringIncome } from "../hooks";
import { RecurringIncomeForm } from "./RecurringIncomeForm";

export function RecurringIncomeList() {
  const { data: recurringIncomes, isPending } = useRecurringIncomes();
  const updateRecurringIncome = useUpdateRecurringIncome();
  const deleteRecurringIncome = useDeleteRecurringIncome();
  const [editing, setEditing] = useState<RecurringIncome | null>(null);

  function handleToggleActive(item: RecurringIncome, active: boolean) {
    updateRecurringIncome.mutate(
      {
        id: item.id,
        input: {
          description: item.description,
          day: item.day,
          value: item.value,
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

  function handleDelete(item: RecurringIncome) {
    if (!confirm(`Excluir a receita recorrente "${item.description}"?`)) return;
    deleteRecurringIncome.mutate(item.id, {
      onSuccess: () => toast.success("Receita recorrente excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando receitas recorrentes...</p>;
  }

  if (!recurringIncomes || recurringIncomes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma receita recorrente cadastrada ainda.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Dia</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringIncomes.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
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
            <DialogTitle>Editar receita recorrente</DialogTitle>
          </DialogHeader>
          {editing && (
            <RecurringIncomeForm recurringIncome={editing} onSuccess={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
