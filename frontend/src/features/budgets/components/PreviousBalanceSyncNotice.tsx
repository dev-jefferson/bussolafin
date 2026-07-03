"use client";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { Budget } from "@/types/api";
import { useSyncPreviousBalance } from "../hooks";

export function isPreviousBalanceOutOfSync(budget: Budget) {
  return (
    budget.expectedPreviousBalance != null &&
    Math.round(budget.expectedPreviousBalance * 100) !== Math.round(budget.previousBalance * 100)
  );
}

export function PreviousBalanceSyncNotice({ budget }: { budget: Budget }) {
  const syncPreviousBalance = useSyncPreviousBalance();

  if (!isPreviousBalanceOutOfSync(budget)) {
    return null;
  }

  function handleSync() {
    syncPreviousBalance.mutate(budget.id, {
      onSuccess: () => toast.success("Sobra anterior atualizada"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível atualizar";
        toast.error(message);
      },
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
      <span>
        O mês anterior mudou desde que este orçamento foi criado — a sobra anterior atualizada
        seria {formatCurrency(budget.expectedPreviousBalance!)}.
      </span>
      <Button
        variant="outline"
        size="xs"
        disabled={syncPreviousBalance.isPending}
        onClick={handleSync}
      >
        <RefreshCw className="size-3" />
        Atualizar
      </Button>
    </div>
  );
}
