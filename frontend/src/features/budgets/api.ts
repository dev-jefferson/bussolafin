import { apiClient } from "@/lib/api-client";
import type { Budget, BudgetSummary, NextBudgetResult } from "@/types/api";
import type { BudgetInput } from "./schemas";

export function listBudgets() {
  return apiClient.get<Budget[]>("/budgets");
}

export function createNextBudget() {
  return apiClient.post<NextBudgetResult>("/budgets/next");
}

export function getBudget(id: string) {
  return apiClient.get<Budget>(`/budgets/${id}`);
}

export function getBudgetSummary(id: string) {
  return apiClient.get<BudgetSummary>(`/budgets/${id}/summary`);
}

export function createBudget(input: BudgetInput) {
  return apiClient.post<Budget>("/budgets", input);
}

export function updateBudget(id: string, input: BudgetInput) {
  return apiClient.put<Budget>(`/budgets/${id}`, input);
}

export function deleteBudget(id: string) {
  return apiClient.delete<void>(`/budgets/${id}`);
}
