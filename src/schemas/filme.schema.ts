import { z } from "zod";

export const filmeSchema = z.object({
  titulo: z.string().nonempty("Título é obrigatório"),
  sinopse: z.string().min(10, "A sinopse deve ter no mínimo 10 caracteres"),
  classificacao: z.string().nonempty("Classificação é obrigatória"),
  duracao: z.string().refine((value) => {
    const n = Number(value);
    return !isNaN(n) && n > 0;
  }, "Duração deve ser um número positivo"),
  genero: z.string().nonempty("Gênero é obrigatório"),
  dataInicio: z.string().nonempty("Data de início é obrigatória"),
  dataFim: z.string().nonempty("Data de fim é obrigatória"),
});

export type FilmeFormData = z.infer<typeof filmeSchema>;
