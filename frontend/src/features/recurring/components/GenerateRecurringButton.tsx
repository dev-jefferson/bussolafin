"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api-client";
import { useGenerateRecurring } from "../hooks";

export function GenerateRecurringButton({ budgetId }: { budgetId: string }) {
  const generateRecurring = useGenerateRecurring(budgetId);

  function handleClick() {
    generateRecurring.mutate(undefined, {
      onSuccess: (result) => {
        if (result.expensesAdded === 0 && result.incomesAdded === 0) {
          toast.info("Nenhum recorrente novo para gerar — já estão todos lançados neste mês");
          return;
        }
        toast.success(
          `${result.expensesAdded} despesa(s) e ${result.incomesAdded} receita(s) recorrentes adicionadas`
        );
      },
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível gerar os recorrentes";
        toast.error(message);
      },
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={generateRecurring.isPending}>
      <RefreshCw className="size-4" />
      Gerar recorrentes
    </Button>
  );
}
