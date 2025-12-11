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
  updateSessao,
  createIngresso,
  getIngressos,
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
  poltrona: "",
};

function SessoesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  const [sessaoFormData, setSessaoFormData] =
    useState<SessaoFormData>(initialSessaoForm);
  const [sessaoErrors, setSessaoErrors] = useState<SessaoFormErrors>({});
  const [sessaoSubmitting, setSessaoSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(
    null
  );
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [ingressoFormData, setIngressoFormData] =
    useState<IngressoFormData>(initialIngressoForm);
  const [ingressoErrors, setIngressoErrors] = useState<IngressoFormErrors>({});
  const [ingressoSubmitting, setIngressoSubmitting] = useState(false);
  const [poltronasOcupadas, setPoltronasOcupadas] = useState<string[]>([]);
  const [loadingPoltronas, setLoadingPoltronas] = useState(false);

  // Estado para múltiplos ingressos
  const [ingressosSelecionados, setIngressosSelecionados] = useState<
    Array<{ poltrona: string; tipo: "inteira" | "meia" }>
  >([]);

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
    setEditingId(null);
  }

  function handleEditSessao(sessao: Sessao) {
    setSessaoFormData({
      filmeId: String(sessao.filmeId),
      salaId: String(sessao.salaId),
      data: sessao.data,
      hora: sessao.hora,
    });
    setEditingId(sessao.id!);
    setSessaoErrors({});

    window.scrollTo({ top: 0, behavior: "smooth" });
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
      const sessaoData: Sessao = {
        filmeId: sessaoFormData.filmeId,
        salaId: sessaoFormData.salaId,
        data: sessaoFormData.data,
        hora: sessaoFormData.hora,
      };

      if (editingId) {
        // EDITANDO
        const atualizada = await updateSessao(editingId, sessaoData);
        setSessoes((prev) =>
          prev.map((s) => (s.id === editingId ? atualizada : s))
        );
        alert("Sessão atualizada com sucesso!");
      } else {
        // CRIANDO
        const criada = await createSessao(sessaoData);
        setSessoes((prev) => [...prev, criada]);
        alert("Sessão cadastrada com sucesso!");
      }

      resetSessaoForm();
    } catch (error) {
      console.error("Erro ao salvar sessão", error);
      alert("Erro ao salvar sessão!");
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

      if (editingId === id) {
        resetSessaoForm();
      }
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

  // ---------- MODAL / INGRESSO / POLTRONAS ----------

  async function abrirModalVenda(sessao: Sessao) {
    setSessaoSelecionada(sessao);

    const sala = salas.find((s) => String(s.id) === String(sessao.salaId));
    setSalaSelecionada(sala || null);

    setIngressoFormData({
      sessaoId: String(sessao.id),
      tipo: "inteira",
      poltrona: "",
    });
    setIngressoErrors({});

    setLoadingPoltronas(true);
    try {
      const ingressos = await getIngressos();
      const ocupadas = ingressos
        .filter((ing) => String(ing.sessaoId) === String(sessao.id))
        .map((ing) => ing.poltrona);
      setPoltronasOcupadas(ocupadas);
    } catch (error) {
      console.error("Erro ao carregar poltronas", error);
      setPoltronasOcupadas([]);
    } finally {
      setLoadingPoltronas(false);
    }

    setShowModal(true);
  }

  function fecharModal() {
    setShowModal(false);
    setSessaoSelecionada(null);
    setSalaSelecionada(null);
    setIngressoErrors({});
    setPoltronasOcupadas([]);
    setIngressosSelecionados([]);
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

  function selecionarPoltrona(poltrona: string) {
    // Verificar se a poltrona já está selecionada
    const jaAdicionada = ingressosSelecionados.find(
      (i) => i.poltrona === poltrona
    );

    if (jaAdicionada) {
      // Remove a poltrona se já estava selecionada
      setIngressosSelecionados((prev) =>
        prev.filter((i) => i.poltrona !== poltrona)
      );
    } else {
      // Adiciona nova poltrona com tipo inteira por padrão
      setIngressosSelecionados((prev) => [
        ...prev,
        { poltrona, tipo: "inteira" },
      ]);
    }
  }

  function alterarTipoIngresso(poltrona: string, tipo: "inteira" | "meia") {
    setIngressosSelecionados((prev) =>
      prev.map((i) => (i.poltrona === poltrona ? { ...i, tipo } : i))
    );
  }

  async function handleIngressoSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sessaoSelecionada) return;

    if (ingressosSelecionados.length === 0) {
      alert("Selecione pelo menos uma poltrona!");
      return;
    }

    setIngressoSubmitting(true);

    try {
      // Criar todos os ingressos selecionados
      for (const ingresso of ingressosSelecionados) {
        const valor = ingresso.tipo === "inteira" ? 34 : 17;

        await createIngresso({
          sessaoId: String(sessaoSelecionada.id),
          tipo: ingresso.tipo,
          poltrona: ingresso.poltrona,
          valor,
          dataVenda: new Date().toISOString(),
        });
      }

      const qtd = ingressosSelecionados.length;
      const total = ingressosSelecionados.reduce(
        (sum, ing) => sum + (ing.tipo === "inteira" ? 34 : 17),
        0
      );

      window.alert(
        `${qtd} ingresso${qtd > 1 ? "s" : ""} vendido${
          qtd > 1 ? "s" : ""
        } com sucesso!\n` + `Total: R$ ${total.toFixed(2)}`
      );
      fecharModal();
    } catch (error) {
      console.error("Erro ao vender ingressos", error);
      alert("Erro ao vender ingressos!");
    } finally {
      setIngressoSubmitting(false);
    }
  }

  function gerarPoltronas() {
    const capacidade = salaSelecionada?.capacidade || 40;
    const fileiras = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const poltronasPorFileira = Math.ceil(capacidade / fileiras.length);

    const poltronas: string[] = [];
    for (let i = 0; i < fileiras.length; i++) {
      for (let j = 1; j <= poltronasPorFileira; j++) {
        if (poltronas.length < capacidade) {
          poltronas.push(`${fileiras[i]}${j}`);
        }
      }
    }
    return poltronas;
  }

  const todasPoltronas = gerarPoltronas();
  const poltronasPorFileira = Math.ceil(
    (salaSelecionada?.capacidade || 40) / 8
  );

  return (
    <div className="mt-4 sessoes-page">
      <style>{`
        .sessoes-page .card-header::before {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%) !important;
        }
        .sessoes-page .table tbody tr.editing {
          background-color: rgba(245, 158, 11, 0.15) !important;
        }
        .sessoes-page .table tbody tr.editing:hover {
          background-color: rgba(245, 158, 11, 0.25) !important;
        }
      `}</style>

      <h1 className="page-title">Sessões</h1>
      <p className="page-subtitle">
        Agende sessões relacionando filmes e salas, com data e horário
        definidos.
      </p>

      <div className="row g-4">
        {/* FORMULÁRIO DE SESSÃO */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header text-white">
              <h5 className="mb-0">
                <i
                  className={`bi ${
                    editingId ? "bi-pencil-square" : "bi-calendar-plus"
                  } me-2`}
                />
                {editingId ? "Editar Sessão" : "Nova Sessão"}
              </h5>
            </div>
            <div className="card-body">
              {filmes.length === 0 || salas.length === 0 ? (
                <p className="text-muted mt-3">
                  Cadastre pelo menos um filme e uma sala antes de criar
                  sessões.
                </p>
              ) : (
                <form onSubmit={handleSessaoSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Filme *</label>
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

                  <div className="mb-3">
                    <label className="form-label fw-bold">Sala *</label>
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
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Data *</label>
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

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Horário *</label>
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

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn text-white flex-grow-1"
                      style={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      }}
                      disabled={sessaoSubmitting}
                    >
                      <i
                        className={`bi ${
                          editingId ? "bi-check-circle" : "bi-save"
                        } me-2`}
                      />
                      {sessaoSubmitting
                        ? "Salvando..."
                        : editingId
                        ? "Atualizar"
                        : "Salvar"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetSessaoForm}
                      >
                        <i className="bi bi-x-circle me-2" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* LISTAGEM DE SESSÕES */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2" />
                Sessões agendadas ({sessoes.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {sessoes.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-clock-history display-1 text-muted"></i>
                  <p className="text-muted mt-3">Nenhuma sessão cadastrada.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Filme</th>
                        <th>Sala</th>
                        <th>Data</th>
                        <th>Horário</th>
                        <th style={{ width: "200px" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessoes.map((sessao) => (
                        <tr
                          key={sessao.id}
                          className={editingId === sessao.id ? "editing" : ""}
                        >
                          <td>{getFilmeTitulo(sessao.filmeId)}</td>
                          <td>Sala {getSalaNumero(sessao.salaId)}</td>
                          <td>{sessao.data}</td>
                          <td>{sessao.hora}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => abrirModalVenda(sessao)}
                                title="Vender Ingresso"
                              >
                                <i className="bi bi-ticket-perforated" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleEditSessao(sessao)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteSessao(sessao.id)}
                                title="Excluir"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
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

      {/* MODAL DE VENDA (MESMO DE ANTES) */}
      {showModal && sessaoSelecionada && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            onClick={fecharModal}
          >
            <div
              className="modal-dialog modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <form onSubmit={handleIngressoSubmit} noValidate>
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      <i className="bi bi-ticket-perforated me-2" />
                      Vender Ingresso
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={fecharModal}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="alert alert-info mb-4">
                      <div className="row">
                        <div className="col-md-4">
                          <strong>
                            <i className="bi bi-film me-1" /> Filme:
                          </strong>
                          <br />
                          {getFilmeTitulo(sessaoSelecionada.filmeId)}
                        </div>
                        <div className="col-md-4">
                          <strong>
                            <i className="bi bi-projector-fill me-1" /> Sala:
                          </strong>
                          <br />
                          Sala {getSalaNumero(sessaoSelecionada.salaId)}
                        </div>
                        <div className="col-md-4">
                          <strong>
                            <i className="bi bi-clock-history me-1" />{" "}
                            Data/Hora:
                          </strong>
                          <br />
                          {sessaoSelecionada.data} às {sessaoSelecionada.hora}
                        </div>
                      </div>
                    </div>

                    {/* Lista de ingressos selecionados */}
                    {ingressosSelecionados.length > 0 && (
                      <div className="mb-4">
                        <label className="form-label fw-bold">
                          <i className="bi bi-ticket-detailed me-2" />
                          Ingressos Selecionados ({ingressosSelecionados.length}
                          )
                        </label>
                        <div
                          className="border rounded p-3"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {ingressosSelecionados.map((ingresso) => (
                            <div
                              key={ingresso.poltrona}
                              className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded"
                              style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="badge bg-primary"
                                  style={{ minWidth: "50px" }}
                                >
                                  <i className="bi bi-chair-fill me-1" />
                                  {ingresso.poltrona}
                                </span>
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                >
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name={`tipo-${ingresso.poltrona}`}
                                    id={`inteira-${ingresso.poltrona}`}
                                    checked={ingresso.tipo === "inteira"}
                                    onChange={() =>
                                      alterarTipoIngresso(
                                        ingresso.poltrona,
                                        "inteira"
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-outline-primary"
                                    htmlFor={`inteira-${ingresso.poltrona}`}
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    Inteira
                                  </label>

                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name={`tipo-${ingresso.poltrona}`}
                                    id={`meia-${ingresso.poltrona}`}
                                    checked={ingresso.tipo === "meia"}
                                    onChange={() =>
                                      alterarTipoIngresso(
                                        ingresso.poltrona,
                                        "meia"
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-outline-success"
                                    htmlFor={`meia-${ingresso.poltrona}`}
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    Meia
                                  </label>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold text-success">
                                  R${" "}
                                  {ingresso.tipo === "inteira"
                                    ? "34,00"
                                    : "17,00"}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    selecionarPoltrona(ingresso.poltrona)
                                  }
                                  title="Remover"
                                >
                                  <i className="bi bi-x" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-chair-fill me-2" />
                        Selecione a Poltrona
                      </label>

                      {loadingPoltronas ? (
                        <div className="text-center p-4">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Carregando...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-center mb-3">
                            <div
                              className="bg-dark text-white py-2 rounded mx-auto"
                              style={{ width: "60%", fontSize: "0.9rem" }}
                            >
                              <i className="bi bi-tv me-2" />
                              TELA
                            </div>
                          </div>

                          <div className="d-flex justify-content-center gap-3 mb-3 small">
                            <span>
                              <i className="bi bi-square-fill text-success me-1" />
                              Disponível
                            </span>
                            <span>
                              <i className="bi bi-square-fill text-danger me-1" />
                              Ocupada
                            </span>
                            <span>
                              <i className="bi bi-square-fill text-primary me-1" />
                              Selecionada
                            </span>
                          </div>

                          <div
                            className="border rounded p-2"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.2)",
                              minHeight: "300px",
                            }}
                          >
                            {["A", "B", "C", "D", "E", "F", "G", "H"].map(
                              (fileira) => {
                                // Calcular quantas poltronas essa fileira tem
                                const poltronasDestaFileira =
                                  todasPoltronas.filter((p) =>
                                    p.startsWith(fileira)
                                  );

                                return (
                                  <div
                                    key={fileira}
                                    className="d-flex justify-content-center align-items-center mb-1"
                                    style={{ gap: "3px" }}
                                  >
                                    <span
                                      className="badge bg-secondary"
                                      style={{
                                        width: "25px",
                                        minWidth: "25px",
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      {fileira}
                                    </span>
                                    {Array.from(
                                      { length: poltronasPorFileira },
                                      (_, i) => {
                                        const poltrona = `${fileira}${i + 1}`;
                                        const ocupada =
                                          poltronasOcupadas.includes(poltrona);
                                        const selecionada =
                                          ingressosSelecionados.some(
                                            (ing) => ing.poltrona === poltrona
                                          );

                                        if (!todasPoltronas.includes(poltrona))
                                          return null;

                                        // Adicionar corredor no meio apenas se houver poltronas suficientes (mais de 4)
                                        const temCorredor =
                                          poltronasDestaFileira.length > 4;
                                        const corredor =
                                          temCorredor &&
                                          i ===
                                            Math.floor(
                                              poltronasPorFileira / 2
                                            ) -
                                              1 ? (
                                            <div
                                              key={`corredor-${fileira}`}
                                              style={{ width: "15px" }}
                                            />
                                          ) : null;

                                        return (
                                          <>
                                            <button
                                              key={poltrona}
                                              type="button"
                                              className={`btn btn-sm ${
                                                ocupada
                                                  ? "btn-danger disabled"
                                                  : selecionada
                                                  ? "btn-primary"
                                                  : "btn-outline-success"
                                              }`}
                                              style={{
                                                width: "36px",
                                                height: "34px",
                                                fontSize: "0.65rem",
                                                padding: "2px",
                                              }}
                                              disabled={ocupada}
                                              onClick={() =>
                                                selecionarPoltrona(poltrona)
                                              }
                                            >
                                              <i
                                                className="bi bi-chair-fill"
                                                style={{ fontSize: "0.8rem" }}
                                              />
                                              <div
                                                style={{
                                                  fontSize: "0.55rem",
                                                  lineHeight: "1",
                                                }}
                                              >
                                                {poltrona}
                                              </div>
                                            </button>
                                            {corredor}
                                          </>
                                        );
                                      }
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="alert alert-dark mb-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fs-5">Valor Total:</div>
                          <small className="text-muted">
                            {ingressosSelecionados.length} ingresso
                            {ingressosSelecionados.length !== 1 ? "s" : ""}
                          </small>
                        </div>
                        <span className="fs-4 fw-bold text-success">
                          R${" "}
                          {ingressosSelecionados
                            .reduce(
                              (sum, ing) =>
                                sum + (ing.tipo === "inteira" ? 34 : 17),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={fecharModal}
                    >
                      <i className="bi bi-x-circle me-2" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        ingressoSubmitting || ingressosSelecionados.length === 0
                      }
                    >
                      <i className="bi bi-check-circle me-2" />
                      {ingressoSubmitting
                        ? "Processando..."
                        : `Confirmar Venda ${
                            ingressosSelecionados.length > 0
                              ? `(${ingressosSelecionados.length})`
                              : ""
                          }`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" onClick={fecharModal} />
        </>
      )}
    </div>
  );
}

export default SessoesPage;
