export interface Ingresso {
  id?: number | string;
  sessaoId: string;
  tipo: "inteira" | "meia";
  valor: number;
  poltrona: string; // ✅ NOVO CAMPO! Ex: "A1", "B5", etc
  dataVenda?: string; // ✅ NOVO CAMPO! Data da venda
}
