import { apiClient } from "@/lib/api-client";
import type { CategoryBreakdownItem, Expense } from "@/types/api";
import type { ExpenseInput } from "./schemas";

export function listExpenses(budgetId: string) {
  return apiClient.get<Expense[]>(`/budgets/${budgetId}/expenses`);
}

export function getExpensesByCategory(budgetId: string) {
  return apiClient.get<CategoryBreakdownItem[]>(`/budgets/${budgetId}/expenses/by-category`);
}

export function createExpense(budgetId: string, input: ExpenseInput) {
  return apiClient.post<Expense>(`/budgets/${budgetId}/expenses`, input);
}

export function updateExpense(budgetId: string, id: string, input: ExpenseInput) {
  return apiClient.put<Expense>(`/budgets/${budgetId}/expenses/${id}`, input);
}

export function setExpensePaid(budgetId: string, id: string, paid: boolean) {
  return apiClient.patch<Expense>(`/budgets/${budgetId}/expenses/${id}/paid`, { paid });
}

export function deleteExpense(budgetId: string, id: string) {
  return apiClient.delete<void>(`/budgets/${budgetId}/expenses/${id}`);
}
