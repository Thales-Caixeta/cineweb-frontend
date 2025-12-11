export interface Sessao {
  id?: number | string;
  filmeId: string; // id do filme em forma de string
  salaId: string; // id da sala em forma de string
  data: string;
  hora: string;
}
