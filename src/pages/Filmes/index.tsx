import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Filme } from "../../models/filme.model";
import { filmeSchema } from "../../schemas/filme.schema";
import type { FilmeFormData } from "../../schemas/filme.schema";
import {
  createFilme,
  deleteFilme,
  getFilmes,
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
      const novoFilme: Filme = {
        titulo: formData.titulo,
        sinopse: formData.sinopse,
        classificacao: formData.classificacao,
        duracao: Number(formData.duracao),
        genero: formData.genero,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
      };

      const criado = await createFilme(novoFilme);
      setFilmes((prev) => [...prev, criado]);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar filme", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir este filme?");
    if (!confirmar) return;

    try {
      await deleteFilme(id);
      setFilmes((prev) => prev.filter((filme) => filme.id !== id));
    } catch (error) {
      console.error("Erro ao excluir filme", error);
    }
  }

  function getInputClass(field: keyof FilmeFormData) {
    return errors[field] ? "form-control is-invalid" : "form-control";
  }

  return (
    <div className="mt-4">
      <h1 className="page-title">Filmes</h1>
      <p className="page-subtitle">
        Cadastre novos filmes e gerencie o catálogo em exibição.
      </p>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-plus-circle me-2" />
                Novo Filme
              </h5>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">Título</label>
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
                  <label className="form-label">Sinopse</label>
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
                  {/* CLASSIFICAÇÃO */}
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Classificação</label>
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

                  {/* DURAÇÃO */}
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Duração (min)</label>
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

                  {/* GÊNERO */}
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Gênero</label>
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
                      <label className="form-label">Data de início</label>
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
                      <label className="form-label">Data de fim</label>
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

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Filme"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-collection-play me-2" />
                Filmes cadastrados
              </h5>

              {filmes.length === 0 ? (
                <p className="text-muted mt-3">Nenhum filme cadastrado.</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Classificação</th>
                        <th>Duração</th>
                        <th>Gênero</th>
                        <th>Período</th>
                        <th style={{ width: "80px" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filmes.map((filme) => (
                        <tr key={filme.id}>
                          <td>{filme.titulo}</td>
                          <td>{filme.classificacao}</td>
                          <td>{filme.duracao} min</td>
                          <td>{filme.genero}</td>
                          <td>
                            {filme.dataInicio} até {filme.dataFim}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(filme.id)}
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
    </div>
  );
}

export default FilmesPage;
