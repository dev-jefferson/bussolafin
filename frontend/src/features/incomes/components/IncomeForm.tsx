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
import type { Income } from "@/types/api";
import { useCreateIncome, useUpdateIncome } from "../hooks";
import { incomeSchema, type IncomeInput } from "../schemas";

export function IncomeForm({
  budgetId,
  income,
  onSuccess,
}: {
  budgetId: string;
  income?: Income;
  onSuccess: () => void;
}) {
  const createIncome = useCreateIncome(budgetId);
  const updateIncome = useUpdateIncome(budgetId);
  const isEditing = !!income;
  const isPending = createIncome.isPending || updateIncome.isPending;

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: income?.description ?? "",
      day: income?.day ?? null,
      value: income?.value ?? 0,
    },
  });

  function onSubmit(values: IncomeInput) {
    const mutation = isEditing
      ? updateIncome.mutateAsync({ id: income!.id, input: values })
      : createIncome.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Receita atualizada" : "Receita adicionada");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar a receita";
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Renda dia 10" {...field} />
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
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Adicionar receita"}
        </Button>
      </form>
    </Form>
  );
}
