import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Filme } from "../../models/filme.model";
import { filmeSchema } from "../../schemas/filme.schema";
import type { FilmeFormData } from "../../schemas/filme.schema";
import {
  createFilme,
  deleteFilme,
  getFilmes,
  updateFilme,
} from "../../services/cinewebApi.service";

type FilmeFormErrors = Partial<Record<keyof FilmeFormData, string>>;

const initialForm: FilmeFormData = {
  titulo: "",
  sinopse: "",
  classificacao: "",
  duracao: "",
  genero: "",
  dataInicio: "",
  dataFim: "",
};

function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [formData, setFormData] = useState<FilmeFormData>(initialForm);
  const [errors, setErrors] = useState<FilmeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  useEffect(() => {
    loadFilmes();
  }, []);

  async function loadFilmes() {
    try {
      const data = await getFilmes();
      setFilmes(data);
    } catch (error) {
      console.error("Erro ao carregar filmes", error);
    }
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData(initialForm);
    setErrors({});
    setEditingId(null);
  }

  function handleEdit(filme: Filme) {
    setFormData({
      titulo: filme.titulo,
      sinopse: filme.sinopse,
      classificacao: filme.classificacao,
      duracao: String(filme.duracao),
      genero: filme.genero,
      dataInicio: filme.dataInicio,
      dataFim: filme.dataFim,
    });
    setEditingId(filme.id!);
    setErrors({});

    // Scroll suave até o formulário
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = filmeSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FilmeFormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FilmeFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const filmeData: Filme = {
        titulo: formData.titulo,
        sinopse: formData.sinopse,
        classificacao: formData.classificacao,
        duracao: Number(formData.duracao),
        genero: formData.genero,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
      };

      if (editingId) {
        // EDITANDO
        const atualizado = await updateFilme(editingId, filmeData);
        setFilmes((prev) =>
          prev.map((f) => (f.id === editingId ? atualizado : f))
        );
        alert("Filme atualizado com sucesso!");
      } else {
        // CRIANDO
        const criado = await createFilme(filmeData);
        setFilmes((prev) => [...prev, criado]);
        alert("Filme cadastrado com sucesso!");
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar filme", error);
      alert("Erro ao salvar filme!");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id?: number | string) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir este filme?");
    if (!confirmar) return;

    try {
      await deleteFilme(id);
      setFilmes((prev) => prev.filter((filme) => filme.id !== id));

      // Se estava editando esse filme, limpa o formulário
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao excluir filme", error);
    }
  }

  function getInputClass(field: keyof FilmeFormData) {
    return errors[field] ? "form-control is-invalid" : "form-control";
  }

  function getClassificacaoColor(classificacao: string) {
    switch (classificacao) {
      case "L":
        return { bg: "#10b981", text: "#fff" }; // Verde
      case "10":
        return { bg: "#3b82f6", text: "#fff" }; // Azul
      case "12":
        return { bg: "#fbbf24", text: "#fff" }; // Amarelo claro
      case "14":
        return { bg: "#f97316", text: "#fff" }; // Laranja
      case "16":
        return { bg: "#ef4444", text: "#fff" }; // Vermelho
      case "18":
        return { bg: "#1f2937", text: "#fff" }; // Preto
      default:
        return { bg: "#6b7280", text: "#fff" }; // Cinza padrão
    }
  }

  return (
    <div className="mt-4 filmes-page">
      <style>{`
        .filmes-page .card-header::before {
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%) !important;
        }
        .filmes-page .table tbody tr.editing {
          background-color: rgba(59, 130, 246, 0.15) !important;
        }
        .filmes-page .table tbody tr.editing:hover {
          background-color: rgba(59, 130, 246, 0.25) !important;
        }
      `}</style>

      <h1 className="page-title">Filmes</h1>
      <p className="page-subtitle">
        Cadastre novos filmes e gerencie o catálogo em exibição.
      </p>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header text-white">
              <h5 className="mb-0">
                <i
                  className={`bi ${
                    editingId ? "bi-pencil-square" : "bi-plus-circle"
                  } me-2`}
                />
                {editingId ? "Editar Filme" : "Novo Filme"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-bold">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    className={getInputClass("titulo")}
                    value={formData.titulo}
                    onChange={handleChange}
                  />
                  {errors.titulo && (
                    <div className="invalid-feedback">{errors.titulo}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Sinopse *</label>
                  <textarea
                    name="sinopse"
                    className={getInputClass("sinopse")}
                    value={formData.sinopse}
                    onChange={handleChange}
                    rows={3}
                  />
                  {errors.sinopse && (
                    <div className="invalid-feedback">{errors.sinopse}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Classificação *
                      </label>
                      <select
                        name="classificacao"
                        className={getInputClass("classificacao")}
                        value={formData.classificacao}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="L">Livre</option>
                        <option value="10">10 anos</option>
                        <option value="12">12 anos</option>
                        <option value="14">14 anos</option>
                        <option value="16">16 anos</option>
                        <option value="18">18 anos</option>
                      </select>
                      {errors.classificacao && (
                        <div className="invalid-feedback">
                          {errors.classificacao}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Duração (min) *
                      </label>
                      <input
                        type="number"
                        name="duracao"
                        className={getInputClass("duracao")}
                        value={formData.duracao}
                        onChange={handleChange}
                        min={1}
                      />
                      {errors.duracao && (
                        <div className="invalid-feedback">{errors.duracao}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Gênero *</label>
                      <select
                        name="genero"
                        className={getInputClass("genero")}
                        value={formData.genero}
                        onChange={handleChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="Ação">Ação</option>
                        <option value="Aventura">Aventura</option>
                        <option value="Comédia">Comédia</option>
                        <option value="Drama">Drama</option>
                        <option value="Terror">Terror</option>
                        <option value="Suspense">Suspense</option>
                        <option value="Romance">Romance</option>
                        <option value="Animação">Animação</option>
                        <option value="Ficção Científica">
                          Ficção Científica
                        </option>
                        <option value="Documentário">Documentário</option>
                      </select>
                      {errors.genero && (
                        <div className="invalid-feedback">{errors.genero}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Data de início *
                      </label>
                      <input
                        type="date"
                        name="dataInicio"
                        className={getInputClass("dataInicio")}
                        value={formData.dataInicio}
                        onChange={handleChange}
                      />
                      {errors.dataInicio && (
                        <div className="invalid-feedback">
                          {errors.dataInicio}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Data de fim *
                      </label>
                      <input
                        type="date"
                        name="dataFim"
                        className={getInputClass("dataFim")}
                        value={formData.dataFim}
                        onChange={handleChange}
                      />
                      {errors.dataFim && (
                        <div className="invalid-feedback">{errors.dataFim}</div>
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
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                    disabled={isSubmitting}
                  >
                    <i
                      className={`bi ${
                        editingId ? "bi-check-circle" : "bi-save"
                      } me-2`}
                    />
                    {isSubmitting
                      ? "Salvando..."
                      : editingId
                      ? "Atualizar"
                      : "Salvar"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      <i className="bi bi-x-circle me-2" />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-collection-play me-2" />
                Filmes cadastrados ({filmes.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {filmes.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-film display-1 text-muted"></i>
                  <p className="text-muted mt-3">
                    Nenhum filme cadastrado ainda.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Título</th>
                        <th>Classificação</th>
                        <th>Duração</th>
                        <th>Gênero</th>
                        <th>Período</th>
                        <th style={{ width: "120px" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filmes.map((filme) => (
                        <tr
                          key={filme.id}
                          className={editingId === filme.id ? "editing" : ""}
                        >
                          <td className="fw-bold">{filme.titulo}</td>
                          <td>
                            <span
                              className="badge fw-bold"
                              style={{
                                backgroundColor: getClassificacaoColor(
                                  filme.classificacao
                                ).bg,
                                color: getClassificacaoColor(
                                  filme.classificacao
                                ).text,
                                border: "2px solid #fff",
                              }}
                            >
                              {filme.classificacao}
                            </span>
                          </td>
                          <td>{filme.duracao} min</td>
                          <td>{filme.genero}</td>
                          <td className="small text-nowrap">
                            <div className="d-flex flex-column gap-1">
                              <div>
                                <i className="bi bi-calendar-check text-success me-1"></i>
                                {new Date(
                                  filme.dataInicio + "T00:00:00"
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </div>
                              <div>
                                <i className="bi bi-calendar-x text-danger me-1"></i>
                                {new Date(
                                  filme.dataFim + "T00:00:00"
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(filme)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(filme.id)}
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
    </div>
  );
}

export default FilmesPage;
