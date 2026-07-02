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
      onSuccess: ({ budget, generation, incomesCopied }) => {
        const label = formatMonthYear(budget.month, budget.year);
        const parts = [];
        if (generation.expensesAdded > 0) parts.push(`${generation.expensesAdded} despesa(s) recorrente(s)`);
        if (generation.incomesAdded > 0) parts.push(`${generation.incomesAdded} receita(s) recorrente(s)`);
        if (incomesCopied > 0) parts.push(`${incomesCopied} receita(s) copiada(s) do mês anterior`);
        const note = parts.length > 0 ? ` (${parts.join(", ")})` : "";
        toast.success(`${label} criado${note}`);
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
