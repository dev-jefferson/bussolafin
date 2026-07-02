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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/features/categories/hooks";
import { ApiRequestError } from "@/lib/api-client";
import type { RecurringExpense } from "@/types/api";
import { useCreateRecurringExpense, useUpdateRecurringExpense } from "../hooks";
import { recurringExpenseSchema, type RecurringExpenseInput } from "../schemas";

export function RecurringExpenseForm({
  recurringExpense,
  onSuccess,
}: {
  recurringExpense?: RecurringExpense;
  onSuccess: () => void;
}) {
  const { data: categories } = useCategories();
  const createRecurringExpense = useCreateRecurringExpense();
  const updateRecurringExpense = useUpdateRecurringExpense();
  const isEditing = !!recurringExpense;
  const isPending = createRecurringExpense.isPending || updateRecurringExpense.isPending;

  const form = useForm<RecurringExpenseInput>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: {
      description: recurringExpense?.description ?? "",
      categoryId: recurringExpense?.category.id ?? "",
      value: recurringExpense?.value ?? 0,
      simulatedValue: recurringExpense?.simulatedValue ?? null,
      active: recurringExpense?.active ?? true,
    },
  });

  function onSubmit(values: RecurringExpenseInput) {
    const mutation = isEditing
      ? updateRecurringExpense.mutateAsync({ id: recurringExpense!.id, input: values })
      : createRecurringExpense.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Despesa recorrente atualizada" : "Despesa recorrente criada");
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
                <Input placeholder="Ex: Aluguel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="simulatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor ajustado (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
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
          {isEditing ? "Salvar alterações" : "Criar despesa recorrente"}
        </Button>
      </form>
    </Form>
  );
}
