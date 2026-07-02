import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as incomesApi from "./api";
import type { IncomeInput } from "./schemas";

const incomesKey = (budgetId: string) => ["budgets", budgetId, "incomes"] as const;
const summaryKey = (budgetId: string) => ["budgets", budgetId, "summary"] as const;

export function useIncomes(budgetId: string) {
  return useQuery({ queryKey: incomesKey(budgetId), queryFn: () => incomesApi.listIncomes(budgetId) });
}

function useInvalidateIncomes(budgetId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: incomesKey(budgetId) });
    queryClient.invalidateQueries({ queryKey: summaryKey(budgetId) });
  };
}

export function useCreateIncome(budgetId: string) {
  const invalidate = useInvalidateIncomes(budgetId);
  return useMutation({
    mutationFn: (input: IncomeInput) => incomesApi.createIncome(budgetId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateIncome(budgetId: string) {
  const invalidate = useInvalidateIncomes(budgetId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: IncomeInput }) =>
      incomesApi.updateIncome(budgetId, id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteIncome(budgetId: string) {
  const invalidate = useInvalidateIncomes(budgetId);
  return useMutation({
    mutationFn: (id: string) => incomesApi.deleteIncome(budgetId, id),
    onSuccess: invalidate,
  });
}
