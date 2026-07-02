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
import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { CategoryList } from "@/features/categories/components/CategoryList";

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo reutilizável de categorias de gasto
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Nova categoria
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <CategoryList />
    </div>
  );
}
