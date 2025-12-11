export interface Lanche {
  id?: number | string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string; // Ex: "Pipoca", "Bebida", "Doce", "Combo"
}
