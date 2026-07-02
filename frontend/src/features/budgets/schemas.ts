import { z } from "zod";

export const budgetSchema = z.object({
  month: z.number().int().min(1, "Mês deve estar entre 1 e 12").max(12, "Mês deve estar entre 1 e 12"),
  year: z.number().int().min(2000, "Ano inválido"),
  previousBalance: z.number().min(0, "Sobra do mês anterior não pode ser negativa"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
