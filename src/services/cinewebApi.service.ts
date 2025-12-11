import axios from "axios";
import type { Filme } from "../models/filme.model";
import type { Sala } from "../models/sala.model";
import type { Sessao } from "../models/sessao.model";
import type { Ingresso } from "../models/ingresso.model";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// ------- FILMES --------
export async function getFilmes(): Promise<Filme[]> {
  const { data } = await api.get<Filme[]>("/filmes");
  return data;
}

export async function createFilme(filme: Filme): Promise<Filme> {
  const { data } = await api.post<Filme>("/filmes", filme);
  return data;
}

export async function updateFilme(
  id: string | number,
  filme: Filme
): Promise<Filme> {
  const { data } = await api.put<Filme>(`/filmes/${id}`, filme);
  return data;
}

export async function deleteFilme(id: string | number): Promise<void> {
  await api.delete(`/filmes/${id}`);
}

// ------- SALAS --------
export async function getSalas(): Promise<Sala[]> {
  const { data } = await api.get<Sala[]>("/salas");
  return data;
}

export async function createSala(sala: Sala): Promise<Sala> {
  const { data } = await api.post<Sala>("/salas", sala);
  return data;
}

export async function updateSala(
  id: string | number,
  sala: Sala
): Promise<Sala> {
  const { data } = await api.put<Sala>(`/salas/${id}`, sala);
  return data;
}

export async function deleteSala(id: string | number): Promise<void> {
  await api.delete(`/salas/${id}`);
}

// ------- SESSÕES --------
export async function getSessoes(): Promise<Sessao[]> {
  const { data } = await api.get<Sessao[]>("/sessoes");
  return data;
}

export async function createSessao(sessao: Sessao): Promise<Sessao> {
  const { data } = await api.post<Sessao>("/sessoes", sessao);
  return data;
}

export async function updateSessao(
  id: string | number,
  sessao: Sessao
): Promise<Sessao> {
  const { data } = await api.put<Sessao>(`/sessoes/${id}`, sessao);
  return data;
}

export async function deleteSessao(id: string | number): Promise<void> {
  await api.delete(`/sessoes/${id}`);
}

// ------- INGRESSOS --------
export async function getIngressos(): Promise<Ingresso[]> {
  const { data } = await api.get<Ingresso[]>("/ingressos");
  return data;
}

export async function createIngresso(ingresso: Ingresso): Promise<Ingresso> {
  const { data } = await api.post<Ingresso>("/ingressos", ingresso);
  return data;
}

export async function deleteIngresso(id: string | number): Promise<void> {
  await api.delete(`/ingressos/${id}`);
}

// ------- LANCHES --------
export async function getLanches(): Promise<any[]> {
  const { data } = await api.get("/lanches");
  return data;
}

export async function createLanche(lanche: any): Promise<any> {
  const { data } = await api.post("/lanches", lanche);
  return data;
}

export async function updateLanche(
  id: string | number,
  lanche: any
): Promise<any> {
  const { data } = await api.put(`/lanches/${id}`, lanche);
  return data;
}

export async function deleteLanche(id: string | number): Promise<void> {
  await api.delete(`/lanches/${id}`);
}
