import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(1, "Nome é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  day: z
    .number()
    .int()
    .min(1, "Dia deve estar entre 1 e 31")
    .max(31, "Dia deve estar entre 1 e 31")
    .nullable()
    .optional(),
  value: z.number().positive("Valor deve ser maior que zero"),
  simulatedValue: z.number().min(0, "Valor simulado não pode ser negativo").nullable().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
