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
import type { Budget } from "@/types/api";
import { useCreateBudget, useUpdateBudget } from "../hooks";
import { budgetSchema, type BudgetInput } from "../schemas";

export function BudgetForm({
  budget,
  onSuccess,
}: {
  budget?: Budget;
  onSuccess: () => void;
}) {
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const isEditing = !!budget;
  const isPending = createBudget.isPending || updateBudget.isPending;

  const now = new Date();
  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: budget?.month ?? now.getMonth() + 1,
      year: budget?.year ?? now.getFullYear(),
      previousBalance: budget?.previousBalance ?? 0,
    },
  });

  function onSubmit(values: BudgetInput) {
    const mutation = isEditing
      ? updateBudget.mutateAsync({ id: budget!.id, input: values })
      : createBudget.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Orçamento atualizado" : "Orçamento criado");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar o orçamento";
        toast.error(message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="previousBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobra do mês anterior</FormLabel>
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
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Criar orçamento"}
        </Button>
      </form>
    </Form>
  );
}
