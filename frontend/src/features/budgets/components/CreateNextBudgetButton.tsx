"use client";

import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api-client";
import { formatMonthYear } from "@/lib/format";
import { useCreateNextBudget } from "../hooks";

export function CreateNextBudgetButton() {
  const router = useRouter();
  const createNextBudget = useCreateNextBudget();

  function handleClick() {
    createNextBudget.mutate(undefined, {
      onSuccess: ({ budget, generation }) => {
        const label = formatMonthYear(budget.month, budget.year);
        const parts = [];
        if (generation.expensesAdded > 0) parts.push(`${generation.expensesAdded} despesa(s)`);
        if (generation.incomesAdded > 0) parts.push(`${generation.incomesAdded} receita(s)`);
        const recurringNote = parts.length > 0 ? ` (${parts.join(" e ")} recorrentes adicionadas)` : "";
        toast.success(`${label} criado${recurringNote}`);
        router.push(`/budgets/${budget.id}`);
      },
      onError: (error) => {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : "Não foi possível criar o próximo orçamento";
        toast.error(message);
      },
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={createNextBudget.isPending}>
      <CalendarPlus className="size-4" />
      Criar próximo mês
    </Button>
  );
}
