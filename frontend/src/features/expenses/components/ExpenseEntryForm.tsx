"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiRequestError } from "@/lib/api-client";
import type { ExpenseEntry } from "@/types/api";
import { useCreateExpenseEntry, useUpdateExpenseEntry } from "../hooks";
import { expenseEntrySchema, type ExpenseEntryInput } from "../schemas";

export function ExpenseEntryForm({
  budgetId,
  expenseId,
  entry,
  onSuccess,
}: {
  budgetId: string;
  expenseId: string;
  entry?: ExpenseEntry;
  onSuccess: () => void;
}) {
  const createEntry = useCreateExpenseEntry(budgetId, expenseId);
  const updateEntry = useUpdateExpenseEntry(budgetId, expenseId);
  const isEditing = !!entry;
  const isPending = createEntry.isPending || updateEntry.isPending;

  const form = useForm<ExpenseEntryInput>({
    resolver: zodResolver(expenseEntrySchema),
    defaultValues: {
      description: entry?.description ?? "",
      day: entry?.day ?? null,
      value: entry?.value ?? 0,
    },
  });

  function onSubmit(values: ExpenseEntryInput) {
    const mutation = isEditing
      ? updateEntry.mutateAsync({ id: entry!.id, input: values })
      : createEntry.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Lançamento atualizado" : "Lançamento adicionado");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar o lançamento";
        toast.error(message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Almoço dia 10" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : e.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Adicionar lançamento"}
        </Button>
      </form>
    </Form>
  );
}
