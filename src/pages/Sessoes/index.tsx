import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Filme } from "../../models/filme.model";
import type { Sala } from "../../models/sala.model";
import type { Sessao } from "../../models/sessao.model";

import { sessaoSchema } from "../../schemas/sessao.schema";
import type { SessaoFormData } from "../../schemas/sessao.schema";

import { ingressoSchema } from "../../schemas/ingresso.schema";
import type { IngressoFormData } from "../../schemas/ingresso.schema";

import {
  getFilmes,
  getSalas,
  getSessoes,
  createSessao,
  deleteSessao,
  createIngresso,
} from "../../services/cinewebApi.service";

type SessaoFormErrors = Partial<Record<keyof SessaoFormData, string>>;
type IngressoFormErrors = Partial<Record<keyof IngressoFormData, string>>;

const initialSessaoForm: SessaoFormData = {
  filmeId: "",
  salaId: "",
  data: "",
  hora: "",
};

const initialIngressoForm: IngressoFormData = {
  sessaoId: "",
  tipo: "inteira",
};

function SessoesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  const [sessaoFormData, setSessaoFormData] =
    useState<SessaoFormData>(initialSessaoForm);
  const [sessaoErrors, setSessaoErrors] = useState<SessaoFormErrors>({});
  const [sessaoSubmitting, setSessaoSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(
    null
  );
  const [ingressoFormData, setIngressoFormData] =
    useState<IngressoFormData>(initialIngressoForm);
  const [ingressoErrors, setIngressoErrors] = useState<IngressoFormErrors>({});
  const [ingressoSubmitting, setIngressoSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [filmesData, salasData, sessoesData] = await Promise.all([
        getFilmes(),
        getSalas(),
        getSessoes(),
      ]);

      setFilmes(filmesData);
      setSalas(salasData);
      setSessoes(sessoesData);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais", error);
    }
  }

  // ---------- SESSÃO ----------

  function handleSessaoChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setSessaoFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetSessaoForm() {
    setSessaoFormData(initialSessaoForm);
    setSessaoErrors({});
  }

  async function handleSessaoSubmit(event: FormEvent) {
    event.preventDefault();
    setSessaoSubmitting(true);

    const result = sessaoSchema.safeParse(sessaoFormData);

    if (!result.success) {
      const fieldErrors: SessaoFormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof SessaoFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setSessaoErrors(fieldErrors);
      setSessaoSubmitting(false);
      return;
    }

    try {
      const novaSessao: Sessao = {
        filmeId: sessaoFormData.filmeId,
        salaId: sessaoFormData.salaId,
        data: sessaoFormData.data,
        hora: sessaoFormData.hora,
      };

      const criada = await createSessao(novaSessao);
      setSessoes((prev) => [...prev, criada]);
      resetSessaoForm();
    } catch (error) {
      console.error("Erro ao criar sessão", error);
    } finally {
      setSessaoSubmitting(false);
    }
  }

  async function handleDeleteSessao(id?: string | number) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir esta sessão?");
    if (!confirmar) return;

    try {
      await deleteSessao(id);
      setSessoes((prev) => prev.filter((sessao) => sessao.id !== id));
    } catch (error) {
      console.error("Erro ao excluir sessão", error);
    }
  }

  function getInputClassSessao(field: keyof SessaoFormData) {
    return sessaoErrors[field] ? "form-control is-invalid" : "form-control";
  }

  function getFilmeTitulo(filmeId: string) {
    const filme = filmes.find((f) => String(f.id) === String(filmeId));
    return filme ? filme.titulo : "—";
  }

  function getSalaNumero(salaId: string) {
    const sala = salas.find((s) => String(s.id) === String(salaId));
    return sala ? sala.numero : "—";
  }

  // ---------- MODAL / INGRESSO ----------

  function abrirModalVenda(sessao: Sessao) {
    setSessaoSelecionada(sessao);
    setIngressoFormData({
      sessaoId: String(sessao.id),
      tipo: "inteira",
    });
    setIngressoErrors({});
    setShowModal(true);
  }

  function fecharModal() {
    setShowModal(false);
    setSessaoSelecionada(null);
    setIngressoErrors({});
  }

  function handleIngressoChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name === "tipo") {
      setIngressoFormData((prev) => ({
        ...prev,
        tipo: value as "inteira" | "meia",
      }));
    }
  }

  async function handleIngressoSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sessaoSelecionada) return;

    setIngressoSubmitting(true);

    const dados: IngressoFormData = {
      sessaoId: String(sessaoSelecionada.id),
      tipo: ingressoFormData.tipo,
    };

    const result = ingressoSchema.safeParse(dados);

    if (!result.success) {
      const fieldErrors: IngressoFormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof IngressoFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setIngressoErrors(fieldErrors);
      setIngressoSubmitting(false);
      return;
    }

    try {
      const valor = dados.tipo === "inteira" ? 34 : 17;

      await createIngresso({
        sessaoId: dados.sessaoId,
        tipo: dados.tipo,
        valor,
      });

      window.alert("Ingresso vendido com sucesso!");
      fecharModal();
    } catch (error) {
      console.error("Erro ao vender ingresso", error);
    } finally {
      setIngressoSubmitting(false);
    }
  }

  function getInputClassIngresso(field: keyof IngressoFormData) {
    return ingressoErrors[field]
      ? "form-check-input is-invalid"
      : "form-check-input";
  }

  return (
    <div className="mt-4">
      <h1 className="page-title">Sessões</h1>
      <p className="page-subtitle">
        Agende sessões relacionando filmes e salas, com data e horário
        definidos.
      </p>

      <div className="row g-4">
        {/* FORMULÁRIO DE SESSÃO */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-plus me-2" />
                Nova Sessão
              </h5>

              {filmes.length === 0 || salas.length === 0 ? (
                <p className="text-muted mt-3">
                  Cadastre pelo menos um filme e uma sala antes de criar
                  sessões.
                </p>
              ) : (
                <form onSubmit={handleSessaoSubmit} noValidate>
                  {/* FILME */}
                  <div className="mb-3">
                    <label className="form-label">Filme</label>
                    <select
                      name="filmeId"
                      className={getInputClassSessao("filmeId")}
                      value={sessaoFormData.filmeId}
                      onChange={handleSessaoChange}
                    >
                      <option value="">Selecione um filme...</option>
                      {filmes.map((filme) => (
                        <option key={filme.id} value={filme.id}>
                          {filme.titulo}
                        </option>
                      ))}
                    </select>
                    {sessaoErrors.filmeId && (
                      <div className="invalid-feedback">
                        {sessaoErrors.filmeId}
                      </div>
                    )}
                  </div>

                  {/* SALA */}
                  <div className="mb-3">
                    <label className="form-label">Sala</label>
                    <select
                      name="salaId"
                      className={getInputClassSessao("salaId")}
                      value={sessaoFormData.salaId}
                      onChange={handleSessaoChange}
                    >
                      <option value="">Selecione uma sala...</option>
                      {salas.map((sala) => (
                        <option key={sala.id} value={sala.id}>
                          Sala {sala.numero} (cap. {sala.capacidade})
                        </option>
                      ))}
                    </select>
                    {sessaoErrors.salaId && (
                      <div className="invalid-feedback">
                        {sessaoErrors.salaId}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    {/* DATA */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Data</label>
                        <input
                          type="date"
                          name="data"
                          className={getInputClassSessao("data")}
                          value={sessaoFormData.data}
                          onChange={handleSessaoChange}
                        />
                        {sessaoErrors.data && (
                          <div className="invalid-feedback">
                            {sessaoErrors.data}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HORA */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Horário</label>
                        <input
                          type="time"
                          name="hora"
                          className={getInputClassSessao("hora")}
                          value={sessaoFormData.hora}
                          onChange={handleSessaoChange}
                        />
                        {sessaoErrors.hora && (
                          <div className="invalid-feedback">
                            {sessaoErrors.hora}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sessaoSubmitting}
                  >
                    {sessaoSubmitting ? "Salvando..." : "Salvar Sessão"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* LISTAGEM DE SESSÕES */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-event me-2" />
                Sessões agendadas
              </h5>

              {sessoes.length === 0 ? (
                <p className="text-muted mt-3">Nenhuma sessão cadastrada.</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Filme</th>
                        <th>Sala</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th style={{ width: "160px" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessoes.map((sessao) => (
                        <tr key={sessao.id}>
                          <td>{getFilmeTitulo(sessao.filmeId)}</td>
                          <td>Sala {getSalaNumero(sessao.salaId)}</td>
                          <td>{sessao.data}</td>
                          <td>{sessao.hora}</td>
                          <td className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm"
                              onClick={() => abrirModalVenda(sessao)}
                            >
                              <i className="bi bi-ticket-perforated" /> Vender
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteSessao(sessao.id)}
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
      </div>

      {/* MODAL DE VENDA DE INGRESSO */}
      {showModal && sessaoSelecionada && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleIngressoSubmit} noValidate>
                  <div className="modal-header">
                    <h5 className="modal-title">Vender ingresso</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={fecharModal}
                    />
                  </div>

                  <div className="modal-body">
                    <p className="mb-2">
                      <strong>Filme:</strong>{" "}
                      {getFilmeTitulo(sessaoSelecionada.filmeId)}
                    </p>
                    <p className="mb-2">
                      <strong>Sala:</strong> Sala{" "}
                      {getSalaNumero(sessaoSelecionada.salaId)}
                    </p>
                    <p className="mb-3">
                      <strong>Data/Hora:</strong> {sessaoSelecionada.data} às{" "}
                      {sessaoSelecionada.hora}
                    </p>

                    <hr />

                    <div className="mb-3">
                      <label className="form-label d-block">
                        Tipo de ingresso
                      </label>

                      <div className="form-check">
                        <input
                          className={getInputClassIngresso("tipo")}
                          type="radio"
                          name="tipo"
                          id="tipoInteira"
                          value="inteira"
                          checked={ingressoFormData.tipo === "inteira"}
                          onChange={handleIngressoChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="tipoInteira"
                        >
                          Inteira (R$ 34,00)
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className={getInputClassIngresso("tipo")}
                          type="radio"
                          name="tipo"
                          id="tipoMeia"
                          value="meia"
                          checked={ingressoFormData.tipo === "meia"}
                          onChange={handleIngressoChange}
                        />
                        <label className="form-check-label" htmlFor="tipoMeia">
                          Meia (R$ 17,00)
                        </label>
                      </div>

                      {ingressoErrors.tipo && (
                        <div className="text-danger small mt-1">
                          {ingressoErrors.tipo}
                        </div>
                      )}
                    </div>

                    <p className="mt-2">
                      <strong>Valor:</strong>{" "}
                      {ingressoFormData.tipo === "inteira"
                        ? "R$ 34,00"
                        : "R$ 17,00"}
                    </p>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={fecharModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={ingressoSubmitting}
                    >
                      {ingressoSubmitting
                        ? "Processando..."
                        : "Confirmar venda"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}

export default SessoesPage;
