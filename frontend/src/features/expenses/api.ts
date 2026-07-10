import { apiClient } from "@/lib/api-client";
import type { CategoryBreakdownItem, Expense, ExpenseEntry } from "@/types/api";
import type { ExpenseEntryInput, ExpenseInput } from "./schemas";

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

export function syncExpenseValueFromEntries(budgetId: string, expenseId: string) {
  return apiClient.post<Expense>(`/budgets/${budgetId}/expenses/${expenseId}/sync-value-from-entries`);
}

export function listExpenseEntries(budgetId: string, expenseId: string) {
  return apiClient.get<ExpenseEntry[]>(`/budgets/${budgetId}/expenses/${expenseId}/entries`);
}

export function createExpenseEntry(budgetId: string, expenseId: string, input: ExpenseEntryInput) {
  return apiClient.post<ExpenseEntry>(`/budgets/${budgetId}/expenses/${expenseId}/entries`, input);
}

export function updateExpenseEntry(
  budgetId: string,
  expenseId: string,
  entryId: string,
  input: ExpenseEntryInput
) {
  return apiClient.put<ExpenseEntry>(
    `/budgets/${budgetId}/expenses/${expenseId}/entries/${entryId}`,
    input
  );
}

export function setExpenseEntryPaid(
  budgetId: string,
  expenseId: string,
  entryId: string,
  paid: boolean
) {
  return apiClient.patch<ExpenseEntry>(
    `/budgets/${budgetId}/expenses/${expenseId}/entries/${entryId}/paid`,
    { paid }
  );
}

export function deleteExpenseEntry(budgetId: string, expenseId: string, entryId: string) {
  return apiClient.delete<void>(`/budgets/${budgetId}/expenses/${expenseId}/entries/${entryId}`);
}
