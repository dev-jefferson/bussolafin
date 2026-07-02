import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as budgetsApi from "./api";
import type { BudgetInput } from "./schemas";

const BUDGETS_KEY = ["budgets"] as const;
const budgetKey = (id: string) => ["budgets", id] as const;
const summaryKey = (id: string) => ["budgets", id, "summary"] as const;

export function useBudgets() {
  return useQuery({ queryKey: BUDGETS_KEY, queryFn: budgetsApi.listBudgets });
}

export function useBudget(id: string) {
  return useQuery({ queryKey: budgetKey(id), queryFn: () => budgetsApi.getBudget(id) });
}

export function useBudgetSummary(id: string) {
  return useQuery({ queryKey: summaryKey(id), queryFn: () => budgetsApi.getBudgetSummary(id) });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.createBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BudgetInput }) =>
      budgetsApi.updateBudget(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY });
      queryClient.invalidateQueries({ queryKey: budgetKey(id) });
      queryClient.invalidateQueries({ queryKey: summaryKey(id) });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.deleteBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function invalidateBudgetSummary(
  queryClient: ReturnType<typeof useQueryClient>,
  budgetId: string
) {
  queryClient.invalidateQueries({ queryKey: summaryKey(budgetId) });
}
