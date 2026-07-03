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
import { Switch } from "@/components/ui/switch";
import { ApiRequestError } from "@/lib/api-client";
import type { RecurringIncome } from "@/types/api";
import { useCreateRecurringIncome, useUpdateRecurringIncome } from "../hooks";
import { recurringIncomeSchema, type RecurringIncomeInput } from "../schemas";

export function RecurringIncomeForm({
  recurringIncome,
  onSuccess,
}: {
  recurringIncome?: RecurringIncome;
  onSuccess: () => void;
}) {
  const createRecurringIncome = useCreateRecurringIncome();
  const updateRecurringIncome = useUpdateRecurringIncome();
  const isEditing = !!recurringIncome;
  const isPending = createRecurringIncome.isPending || updateRecurringIncome.isPending;

  const form = useForm<RecurringIncomeInput>({
    resolver: zodResolver(recurringIncomeSchema),
    defaultValues: {
      description: recurringIncome?.description ?? "",
      day: recurringIncome?.day ?? null,
      value: recurringIncome?.value ?? 0,
      active: recurringIncome?.active ?? true,
    },
  });

  function onSubmit(values: RecurringIncomeInput) {
    const mutation = isEditing
      ? updateRecurringIncome.mutateAsync({ id: recurringIncome!.id, input: values })
      : createRecurringIncome.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Receita recorrente atualizada" : "Receita recorrente criada");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar";
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Salário" {...field} />
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
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Ativo</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Entra automaticamente ao gerar recorrentes num orçamento
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Criar receita recorrente"}
        </Button>
      </form>
    </Form>
  );
}
