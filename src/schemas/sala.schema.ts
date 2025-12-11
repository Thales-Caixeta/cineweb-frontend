import { z } from "zod";

export const salaSchema = z.object({
  numero: z.string().nonempty("Número da sala é obrigatório"),
  capacidade: z.string().refine((value) => {
    const n = Number(value);
    return !isNaN(n) && n > 0;
  }, "Capacidade deve ser um número positivo"),
});

export type SalaFormData = z.infer<typeof salaSchema>;
