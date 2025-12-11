import { z } from "zod";

export const lancheSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres"),
  preco: z.string().refine((value) => {
    const n = Number(value);
    return !isNaN(n) && n > 0;
  }, "Preço deve ser um número positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
});

export type LancheFormData = z.infer<typeof lancheSchema>;
