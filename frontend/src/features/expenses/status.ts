import type { Budget } from "@/types/api";

export type ItemStatus = "paid" | "pending" | "overdue";

export const STATUS_STYLES: Record<ItemStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  overdue: "bg-red-100 text-red-800 hover:bg-red-200",
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Não pago",
};

export function getItemStatus(item: { day: number | null; paid: boolean }, budget?: Budget): ItemStatus {
  if (item.paid) return "paid";
  if (!budget || item.day == null) return "pending";
  const dueDate = new Date(budget.year, budget.month - 1, item.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today ? "overdue" : "pending";
}
