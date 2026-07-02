import { z } from "zod";

export const incomeSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  day: z
    .number()
    .int()
    .min(1, "Dia deve estar entre 1 e 31")
    .max(31, "Dia deve estar entre 1 e 31")
    .nullable()
    .optional(),
  value: z.number().positive("Valor deve ser maior que zero"),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
