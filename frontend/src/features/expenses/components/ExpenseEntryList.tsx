"use client";

import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Budget, Expense, ExpenseEntry } from "@/types/api";
import {
  useDeleteExpenseEntry,
  useExpenseEntries,
  useSetExpenseEntryPaid,
  useSyncExpenseValueFromEntries,
} from "../hooks";
import { getItemStatus, STATUS_LABELS, STATUS_STYLES } from "../status";
import { ExpenseEntryForm } from "./ExpenseEntryForm";

export function ExpenseEntryList({
  budgetId,
  expense,
  budget,
}: {
  budgetId: string;
  expense: Expense;
  budget?: Budget;
}) {
  const { data: entries, isPending } = useExpenseEntries(budgetId, expense.id, true);
  const deleteEntry = useDeleteExpenseEntry(budgetId, expense.id);
  const setEntryPaid = useSetExpenseEntryPaid(budgetId, expense.id);
  const syncValue = useSyncExpenseValueFromEntries(budgetId);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);

  function handleTogglePaid(entry: ExpenseEntry) {
    setEntryPaid.mutate(
      { id: entry.id, paid: !entry.paid },
      {
        onError: (error) => {
          const message =
            error instanceof ApiRequestError ? error.message : "Não foi possível atualizar";
          toast.error(message);
        },
      }
    );
  }

  function handleDelete(entry: ExpenseEntry) {
    if (!confirm("Excluir este lançamento?")) return;
    deleteEntry.mutate(entry.id, {
      onSuccess: () => toast.success("Lançamento excluído"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  function handleSyncValue() {
    syncValue.mutate(expense.id, {
      onSuccess: () => toast.success("Valor da despesa atualizado"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível atualizar o valor";
        toast.error(message);
      },
    });
  }

  if (isPending) {
    return <p className="py-2 text-sm text-muted-foreground">Carregando lançamentos...</p>;
  }

  const list = entries ?? [];
  const total = list.reduce((sum, entry) => sum + entry.value, 0);
  const isOutOfSync = list.length > 0 && Math.round(total * 100) !== Math.round(expense.value * 100);

  return (
    <div className="grid gap-3 py-2 pl-6">
      <div className="flex items-center gap-2">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button variant="outline" size="xs" />}>
            <Plus className="size-3.5" />
            Adicionar lançamento
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lançamento</DialogTitle>
            </DialogHeader>
            <ExpenseEntryForm
              budgetId={budgetId}
              expenseId={expense.id}
              onSuccess={() => setCreating(false)}
            />
          </DialogContent>
        </Dialog>

        {isOutOfSync && (
          <Button
            variant="outline"
            size="xs"
            disabled={syncValue.isPending}
            onClick={handleSyncValue}
          >
            <RefreshCw className="size-3.5" />
            Atualizar valor da despesa ({formatCurrency(total)})
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
      ) : (
        <div className="grid gap-1.5">
          <p className="text-sm text-muted-foreground">
            Total lançamentos: <span className="font-medium">{formatCurrency(total)}</span>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dia</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((entry, index) => {
                const status = getItemStatus(entry, budget);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {entry.description || `Lançamento ${index + 1}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.day ?? "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.value)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("cursor-pointer border-0", STATUS_STYLES[status])}
                        onClick={() => handleTogglePaid(entry)}
                        title="Clique para marcar como pago/não pago"
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(entry)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(entry)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar lançamento</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExpenseEntryForm
              budgetId={budgetId}
              expenseId={expense.id}
              entry={editing}
              onSuccess={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
