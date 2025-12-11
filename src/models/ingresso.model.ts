export interface Ingresso {
  id?: number | string;
  sessaoId: string;
  tipo: "inteira" | "meia";
  valor: number;
}
