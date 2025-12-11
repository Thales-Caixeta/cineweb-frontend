import { z } from "zod";

export const ingressoSchema = z.object({
  sessaoId: z.string().nonempty("Sessão é obrigatória"),
  tipo: z.enum(["inteira", "meia"], {
    errorMap: () => ({ message: "Selecione o tipo de ingresso" }),
  }),
});

export type IngressoFormData = z.infer<typeof ingressoSchema>;
