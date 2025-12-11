import { z } from "zod";

// Data de hoje no formato YYYY-MM-DD
const hoje = new Date();
const hojeISO = hoje.toISOString().slice(0, 10);

export const sessaoSchema = z.object({
  filmeId: z.string().nonempty("Selecione um filme"),
  salaId: z.string().nonempty("Selecione uma sala"),
  data: z
    .string()
    .nonempty("Data da sessão é obrigatória")
    .refine(
      (value) => value >= hojeISO,
      "A data da sessão não pode ser retroativa"
    ),
  hora: z.string().nonempty("Horário da sessão é obrigatório"),
});

export type SessaoFormData = z.infer<typeof sessaoSchema>;
