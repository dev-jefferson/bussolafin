import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as categoriesApi from "./api";
import type { CategoryInput } from "./schemas";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: categoriesApi.listCategories });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      categoriesApi.updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
