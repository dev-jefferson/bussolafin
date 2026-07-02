import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as recurringApi from "./api";
import type { RecurringExpenseInput, RecurringIncomeInput } from "./schemas";

const RECURRING_EXPENSES_KEY = ["recurring-expenses"] as const;
const RECURRING_INCOMES_KEY = ["recurring-incomes"] as const;

const expensesKey = (budgetId: string) => ["budgets", budgetId, "expenses"] as const;
const breakdownKey = (budgetId: string) => ["budgets", budgetId, "expenses", "by-category"] as const;
const incomesKey = (budgetId: string) => ["budgets", budgetId, "incomes"] as const;
const summaryKey = (budgetId: string) => ["budgets", budgetId, "summary"] as const;

export function useRecurringExpenses() {
  return useQuery({ queryKey: RECURRING_EXPENSES_KEY, queryFn: recurringApi.listRecurringExpenses });
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.createRecurringExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY }),
  });
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecurringExpenseInput }) =>
      recurringApi.updateRecurringExpense(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY }),
  });
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.deleteRecurringExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY }),
  });
}

export function useRecurringIncomes() {
  return useQuery({ queryKey: RECURRING_INCOMES_KEY, queryFn: recurringApi.listRecurringIncomes });
}

export function useCreateRecurringIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.createRecurringIncome,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_INCOMES_KEY }),
  });
}

export function useUpdateRecurringIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecurringIncomeInput }) =>
      recurringApi.updateRecurringIncome(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_INCOMES_KEY }),
  });
}

export function useDeleteRecurringIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.deleteRecurringIncome,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_INCOMES_KEY }),
  });
}

export function useGenerateRecurring(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => recurringApi.generateRecurring(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKey(budgetId) });
      queryClient.invalidateQueries({ queryKey: breakdownKey(budgetId) });
      queryClient.invalidateQueries({ queryKey: incomesKey(budgetId) });
      queryClient.invalidateQueries({ queryKey: summaryKey(budgetId) });
    },
  });
}

export function usePromoteExpenseToRecurring(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => recurringApi.promoteExpenseToRecurring(budgetId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKey(budgetId) });
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY });
    },
  });
}

export function usePromoteIncomeToRecurring(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incomeId: string) => recurringApi.promoteIncomeToRecurring(budgetId, incomeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomesKey(budgetId) });
      queryClient.invalidateQueries({ queryKey: RECURRING_INCOMES_KEY });
    },
  });
}
