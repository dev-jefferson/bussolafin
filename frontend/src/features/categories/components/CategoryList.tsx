"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiRequestError } from "@/lib/api-client";
import type { Category } from "@/types/api";
import { useCategories, useDeleteCategory } from "../hooks";
import { CategoryForm } from "./CategoryForm";

export function CategoryList() {
  const { data: categories, isPending } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState<Category | null>(null);

  function handleDelete(category: Category) {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;
    deleteCategory.mutate(category.id, {
      onSuccess: () => toast.success("Categoria excluída"),
      onError: (error) => {
        const message =
          error instanceof ApiRequestError ? error.message : "Não foi possível excluir";
        toast.error(message);
      },
    });
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando categorias...</p>;
  }

  if (!categories || categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                {category.adjustable ? (
                  <Badge variant="secondary">Ajustável</Badge>
                ) : (
                  <Badge variant="outline">Fixo</Badge>
                )}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(category)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(category)}>
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryForm category={editing} onSuccess={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
