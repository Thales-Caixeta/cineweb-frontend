import { z } from "zod";

export const ingressoSchema = z.object({
  sessaoId: z.string().min(1, "Sessão é obrigatória"),
  tipo: z.enum(["inteira", "meia"]),
  poltrona: z.string().min(1, "Selecione uma poltrona"),
});

export type IngressoFormData = z.infer<typeof ingressoSchema>;
