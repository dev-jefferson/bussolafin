import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  adjustable: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
