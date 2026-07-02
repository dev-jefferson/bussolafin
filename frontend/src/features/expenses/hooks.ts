import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as expensesApi from "./api";
import type { ExpenseInput } from "./schemas";

const expensesKey = (budgetId: string) => ["budgets", budgetId, "expenses"] as const;
const breakdownKey = (budgetId: string) => ["budgets", budgetId, "expenses", "by-category"] as const;
const summaryKey = (budgetId: string) => ["budgets", budgetId, "summary"] as const;

export function useExpenses(budgetId: string) {
  return useQuery({ queryKey: expensesKey(budgetId), queryFn: () => expensesApi.listExpenses(budgetId) });
}

export function useExpensesByCategory(budgetId: string) {
  return useQuery({
    queryKey: breakdownKey(budgetId),
    queryFn: () => expensesApi.getExpensesByCategory(budgetId),
  });
}

function useInvalidateExpenses(budgetId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: expensesKey(budgetId) });
    queryClient.invalidateQueries({ queryKey: breakdownKey(budgetId) });
    queryClient.invalidateQueries({ queryKey: summaryKey(budgetId) });
  };
}

export function useCreateExpense(budgetId: string) {
  const invalidate = useInvalidateExpenses(budgetId);
  return useMutation({
    mutationFn: (input: ExpenseInput) => expensesApi.createExpense(budgetId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateExpense(budgetId: string) {
  const invalidate = useInvalidateExpenses(budgetId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) =>
      expensesApi.updateExpense(budgetId, id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense(budgetId: string) {
  const invalidate = useInvalidateExpenses(budgetId);
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(budgetId, id),
    onSuccess: invalidate,
  });
}
