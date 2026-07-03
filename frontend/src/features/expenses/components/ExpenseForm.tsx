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
import { useCategories } from "@/features/categories/hooks";
import { ApiRequestError } from "@/lib/api-client";
import type { Expense } from "@/types/api";
import { useCreateExpense, useUpdateExpense } from "../hooks";
import { expenseSchema, type ExpenseInput } from "../schemas";

export function ExpenseForm({
  budgetId,
  expense,
  onSuccess,
}: {
  budgetId: string;
  expense?: Expense;
  onSuccess: () => void;
}) {
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense(budgetId);
  const updateExpense = useUpdateExpense(budgetId);
  const isEditing = !!expense;
  const isPending = createExpense.isPending || updateExpense.isPending;

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: expense?.description ?? "",
      categoryId: expense?.category.id ?? "",
      day: expense?.day ?? null,
      value: expense?.value ?? 0,
      simulatedValue: expense?.simulatedValue ?? null,
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories?.find((category) => category.id === selectedCategoryId);
  const isAdjustable = selectedCategory?.adjustable ?? false;

  function onSubmit(values: ExpenseInput) {
    const payload = isAdjustable ? values : { ...values, simulatedValue: null };
    const mutation = isEditing
      ? updateExpense.mutateAsync({ id: expense!.id, input: payload })
      : createExpense.mutateAsync(payload);

    mutation
      .then(() => {
        toast.success(isEditing ? "Despesa atualizada" : "Despesa adicionada");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar a despesa";
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
                <Input placeholder="Ex: Gasolina" {...field} />
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  const category = categories?.find((c) => c.id === value);
                  if (!category?.adjustable) {
                    form.setValue("simulatedValue", null);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria">
                      {(value: string | null) =>
                        categories?.find((c) => c.id === value)?.name ?? "Selecione uma categoria"
                      }
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} {category.adjustable ? "(ajustável)" : ""}
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
        {isAdjustable && (
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
        )}
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Adicionar despesa"}
        </Button>
      </form>
    </Form>
  );
}
