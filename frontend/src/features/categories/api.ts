import { apiClient } from "@/lib/api-client";
import type { Category } from "@/types/api";
import type { CategoryInput } from "./schemas";

export function listCategories() {
  return apiClient.get<Category[]>("/categories");
}

export function createCategory(input: CategoryInput) {
  return apiClient.post<Category>("/categories", input);
}

export function updateCategory(id: string, input: CategoryInput) {
  return apiClient.put<Category>(`/categories/${id}`, input);
}

export function deleteCategory(id: string) {
  return apiClient.delete<void>(`/categories/${id}`);
}
