import { apiClient } from "@/lib/api-client";
import type { Income } from "@/types/api";
import type { IncomeInput } from "./schemas";

export function listIncomes(budgetId: string) {
  return apiClient.get<Income[]>(`/budgets/${budgetId}/incomes`);
}

export function createIncome(budgetId: string, input: IncomeInput) {
  return apiClient.post<Income>(`/budgets/${budgetId}/incomes`, input);
}

export function updateIncome(budgetId: string, id: string, input: IncomeInput) {
  return apiClient.put<Income>(`/budgets/${budgetId}/incomes/${id}`, input);
}

export function deleteIncome(budgetId: string, id: string) {
  return apiClient.delete<void>(`/budgets/${budgetId}/incomes/${id}`);
}
