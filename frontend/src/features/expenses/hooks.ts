import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as expensesApi from "./api";
import type { ExpenseEntryInput, ExpenseInput } from "./schemas";

const expensesKey = (budgetId: string) => ["budgets", budgetId, "expenses"] as const;
const breakdownKey = (budgetId: string) => ["budgets", budgetId, "expenses", "by-category"] as const;
const summaryKey = (budgetId: string) => ["budgets", budgetId, "summary"] as const;
const entriesKey = (budgetId: string, expenseId: string) =>
  ["budgets", budgetId, "expenses", expenseId, "entries"] as const;

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

export function useSetExpensePaid(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      expensesApi.setExpensePaid(budgetId, id, paid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKey(budgetId) }),
  });
}

export function useDeleteExpense(budgetId: string) {
  const invalidate = useInvalidateExpenses(budgetId);
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(budgetId, id),
    onSuccess: invalidate,
  });
}

export function useSyncExpenseValueFromEntries(budgetId: string) {
  const invalidate = useInvalidateExpenses(budgetId);
  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.syncExpenseValueFromEntries(budgetId, expenseId),
    onSuccess: invalidate,
  });
}

export function useExpenseEntries(budgetId: string, expenseId: string, enabled: boolean) {
  return useQuery({
    queryKey: entriesKey(budgetId, expenseId),
    queryFn: () => expensesApi.listExpenseEntries(budgetId, expenseId),
    enabled,
  });
}

function useInvalidateExpenseEntries(budgetId: string, expenseId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: entriesKey(budgetId, expenseId) });
}

export function useCreateExpenseEntry(budgetId: string, expenseId: string) {
  const invalidate = useInvalidateExpenseEntries(budgetId, expenseId);
  return useMutation({
    mutationFn: (input: ExpenseEntryInput) => expensesApi.createExpenseEntry(budgetId, expenseId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateExpenseEntry(budgetId: string, expenseId: string) {
  const invalidate = useInvalidateExpenseEntries(budgetId, expenseId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseEntryInput }) =>
      expensesApi.updateExpenseEntry(budgetId, expenseId, id, input),
    onSuccess: invalidate,
  });
}

export function useSetExpenseEntryPaid(budgetId: string, expenseId: string) {
  const invalidate = useInvalidateExpenseEntries(budgetId, expenseId);
  return useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      expensesApi.setExpenseEntryPaid(budgetId, expenseId, id, paid),
    onSuccess: invalidate,
  });
}

export function useDeleteExpenseEntry(budgetId: string, expenseId: string) {
  const invalidate = useInvalidateExpenseEntries(budgetId, expenseId);
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpenseEntry(budgetId, expenseId, id),
    onSuccess: invalidate,
  });
}
