"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BudgetForm } from "@/features/budgets/components/BudgetForm";
import { BudgetList } from "@/features/budgets/components/BudgetList";
import { CreateNextBudgetButton } from "@/features/budgets/components/CreateNextBudgetButton";

export default function BudgetsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Seus meses de controle financeiro</p>
        </div>
        <div className="flex gap-2">
          <CreateNextBudgetButton />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Novo orçamento
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo orçamento</DialogTitle>
              </DialogHeader>
              <BudgetForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <BudgetList />
    </div>
  );
}
