import { apiClient } from "@/lib/api-client";
import type {
  GenerateRecurringResult,
  RecurringExpense,
  RecurringIncome,
} from "@/types/api";
import type { RecurringExpenseInput, RecurringIncomeInput } from "./schemas";

export function listRecurringExpenses() {
  return apiClient.get<RecurringExpense[]>("/recurring-expenses");
}

export function createRecurringExpense(input: RecurringExpenseInput) {
  return apiClient.post<RecurringExpense>("/recurring-expenses", input);
}

export function updateRecurringExpense(id: string, input: RecurringExpenseInput) {
  return apiClient.put<RecurringExpense>(`/recurring-expenses/${id}`, input);
}

export function deleteRecurringExpense(id: string) {
  return apiClient.delete<void>(`/recurring-expenses/${id}`);
}

export function listRecurringIncomes() {
  return apiClient.get<RecurringIncome[]>("/recurring-incomes");
}

export function createRecurringIncome(input: RecurringIncomeInput) {
  return apiClient.post<RecurringIncome>("/recurring-incomes", input);
}

export function updateRecurringIncome(id: string, input: RecurringIncomeInput) {
  return apiClient.put<RecurringIncome>(`/recurring-incomes/${id}`, input);
}

export function deleteRecurringIncome(id: string) {
  return apiClient.delete<void>(`/recurring-incomes/${id}`);
}

export function generateRecurring(budgetId: string) {
  return apiClient.post<GenerateRecurringResult>(`/budgets/${budgetId}/generate-recurring`);
}

export function promoteExpenseToRecurring(budgetId: string, expenseId: string) {
  return apiClient.post<RecurringExpense>(
    `/budgets/${budgetId}/expenses/${expenseId}/promote-to-recurring`
  );
}

export function promoteIncomeToRecurring(budgetId: string, incomeId: string) {
  return apiClient.post<RecurringIncome>(
    `/budgets/${budgetId}/incomes/${incomeId}/promote-to-recurring`
  );
}
