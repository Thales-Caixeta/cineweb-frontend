import { useEffect, useState } from "react";
import type { Ingresso } from "../../models/ingresso.model";
import type { Sessao } from "../../models/sessao.model";
import type { Filme } from "../../models/filme.model";
import type { Sala } from "../../models/sala.model";
import {
  getIngressos,
  getSessoes,
  getFilmes,
  getSalas,
  deleteIngresso,
} from "../../services/cinewebApi.service";

interface IngressoCompleto extends Ingresso {
  sessao?: Sessao;
  filme?: Filme;
  sala?: Sala;
}

function VendasPage() {
  const [ingressos, setIngressos] = useState<IngressoCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngressos();
  }, []);

  async function loadIngressos() {
    try {
      const [ingressosData, sessoesData, filmesData, salasData] =
        await Promise.all([
          getIngressos(),
          getSessoes(),
          getFilmes(),
          getSalas(),
        ]);

      // Cruzar dados
      const ingressosCompletos = ingressosData.map((ingresso) => {
        const sessao = sessoesData.find(
          (s) => String(s.id) === String(ingresso.sessaoId)
        );
        const filme = sessao
          ? filmesData.find((f) => String(f.id) === String(sessao.filmeId))
          : undefined;
        const sala = sessao
          ? salasData.find((s) => String(s.id) === String(sessao.salaId))
          : undefined;

        return {
          ...ingresso,
          sessao,
          filme,
          sala,
        };
      });

      setIngressos(ingressosCompletos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar ingressos", error);
      setLoading(false);
    }
  }

  async function handleDelete(id?: string | number) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir este ingresso?");
    if (!confirmar) return;

    try {
      await deleteIngresso(id);
      setIngressos((prev) => prev.filter((ing) => ing.id !== id));
    } catch (error) {
      console.error("Erro ao excluir ingresso", error);
    }
  }

  // Estatísticas
  const totalIngressos = ingressos.length;
  const totalArrecadado = ingressos.reduce((acc, ing) => acc + ing.valor, 0);
  const totalInteiras = ingressos.filter((i) => i.tipo === "inteira").length;
  const totalMeias = ingressos.filter((i) => i.tipo === "meia").length;

  if (loading) {
    return (
      <div className="mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h1 className="page-title">Vendas de Ingressos</h1>
      <p className="page-subtitle">
        Relatório de ingressos vendidos e arrecadação total.
      </p>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total de Ingressos</p>
                  <h3 className="mb-0">{totalIngressos}</h3>
                </div>
                <i className="bi bi-ticket-detailed display-4 text-primary opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Arrecadado</p>
                  <h3 className="mb-0 text-success">
                    R$ {totalArrecadado.toFixed(2)}
                  </h3>
                </div>
                <i className="bi bi-cash-stack display-4 text-success opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Ingressos Inteiros</p>
                  <h3 className="mb-0 text-info">{totalInteiras}</h3>
                </div>
                <i className="bi bi-ticket display-4 text-info opacity-25" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Ingressos Meia</p>
                  <h3 className="mb-0 text-warning">{totalMeias}</h3>
                </div>
                <i className="bi bi-ticket-perforated display-4 text-warning opacity-25" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA DE INGRESSOS */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-list-ul me-2" />
            Histórico de Vendas
          </h5>

          {ingressos.length === 0 ? (
            <p className="text-muted mt-3">Nenhum ingresso vendido ainda.</p>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Filme</th>
                    <th>Sala</th>
                    <th>Poltrona</th>
                    <th>Data/Hora Sessão</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th style={{ width: "80px" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ingressos.map((ingresso) => (
                    <tr key={ingresso.id}>
                      <td>
                        <span className="badge bg-secondary">
                          #{ingresso.id}
                        </span>
                      </td>
                      <td>
                        <i className="bi bi-film me-2 text-primary" />
                        {ingresso.filme?.titulo || "N/A"}
                      </td>
                      <td>
                        <i className="bi bi-door-open me-2 text-info" />
                        Sala {ingresso.sala?.numero || "N/A"}
                      </td>
                      <td>
                        <span className="badge bg-dark">
                          <i className="bi bi-chair-fill me-1" />
                          {ingresso.poltrona || "N/A"}
                        </span>
                      </td>
                      <td className="small">
                        {ingresso.sessao
                          ? `${ingresso.sessao.data} às ${ingresso.sessao.hora}`
                          : "N/A"}
                      </td>
                      <td>
                        {ingresso.tipo === "inteira" ? (
                          <span className="badge bg-primary">Inteira</span>
                        ) : (
                          <span className="badge bg-success">Meia</span>
                        )}
                      </td>
                      <td className="fw-bold text-success">
                        R$ {ingresso.valor.toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(ingresso.id)}
                          title="Excluir"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendasPage;
