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
import type { Category } from "@/types/api";
import { useCreateCategory, useUpdateCategory } from "../hooks";
import { categorySchema, type CategoryInput } from "../schemas";

export function CategoryForm({
  category,
  onSuccess,
}: {
  category?: Category;
  onSuccess: () => void;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = !!category;
  const isPending = createCategory.isPending || updateCategory.isPending;

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
    },
  });

  function onSubmit(values: CategoryInput) {
    const mutation = isEditing
      ? updateCategory.mutateAsync({ id: category!.id, input: values })
      : createCategory.mutateAsync(values);

    mutation
      .then(() => {
        toast.success(isEditing ? "Categoria atualizada" : "Categoria criada");
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível salvar a categoria";
        toast.error(message);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: COMIDA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Salvar alterações" : "Criar categoria"}
        </Button>
      </form>
    </Form>
  );
}
