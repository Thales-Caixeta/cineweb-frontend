import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Lanche } from "../../models/lanche.model";
import { lancheSchema } from "../../schemas/lanche.schema";
import type { LancheFormData } from "../../schemas/lanche.schema";
import {
  getLanches,
  createLanche,
  deleteLanche,
  updateLanche,
} from "../../services/cinewebApi.service";

type LancheFormErrors = Partial<Record<keyof LancheFormData, string>>;

const initialForm: LancheFormData = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "",
};

function LanchesPage() {
  const [lanches, setLanches] = useState<Lanche[]>([]);
  const [formData, setFormData] = useState<LancheFormData>(initialForm);
  const [errors, setErrors] = useState<LancheFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  useEffect(() => {
    carregarLanches();
  }, []);

  async function carregarLanches() {
    try {
      const data = await getLanches();
      setLanches(data);
    } catch (error) {
      console.error("Erro ao carregar lanches", error);
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

  function handleEdit(lanche: Lanche) {
    setFormData({
      nome: lanche.nome,
      descricao: lanche.descricao,
      preco: String(lanche.preco),
      categoria: lanche.categoria,
    });
    setEditingId(lanche.id!);
    setErrors({});

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = lancheSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: LancheFormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof LancheFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const lancheData: Lanche = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: Number(formData.preco),
        categoria: formData.categoria,
      };

      if (editingId) {
        // EDITANDO
        const atualizado = await updateLanche(editingId, lancheData);
        setLanches((prev) =>
          prev.map((l) => (l.id === editingId ? atualizado : l))
        );
        alert("Lanche atualizado com sucesso!");
      } else {
        // CRIANDO
        const criado = await createLanche(lancheData);
        setLanches((prev) => [...prev, criado]);
        alert("Lanche cadastrado com sucesso!");
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar lanche", error);
      alert("Erro ao salvar lanche!");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id?: number | string) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir este lanche?");
    if (!confirmar) return;

    try {
      await deleteLanche(id);
      setLanches((prev) => prev.filter((lanche) => lanche.id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao excluir lanche", error);
    }
  }

  function getInputClass(field: keyof LancheFormData) {
    return errors[field] ? "form-control is-invalid" : "form-control";
  }

  function getIconeCategoria(cat: string) {
    switch (cat) {
      case "Pipoca":
        return "bi-basket";
      case "Bebida":
        return "bi-cup-straw";
      case "Doce":
        return "bi-candy";
      case "Combo":
        return "bi-box-seam";
      default:
        return "bi-bag";
    }
  }

  function getCorCategoria(cat: string) {
    switch (cat) {
      case "Pipoca":
        return "warning";
      case "Bebida":
        return "info";
      case "Doce":
        return "danger";
      case "Combo":
        return "success";
      default:
        return "secondary";
    }
  }

  return (
    <div className="mt-4 lanches-page">
      <style>{`
        .lanches-page .card-header::before {
          background: linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #ec4899 100%) !important;
        }
        .lanches-page .card.editing {
          background-color: rgba(236, 72, 153, 0.15) !important;
          border-color: rgba(236, 72, 153, 0.5) !important;
        }
      `}</style>

      <h1 className="page-title">Lanches e Combos</h1>
      <p className="page-subtitle">
        Cadastre lanches, bebidas e combos disponíveis na bomboniere.
      </p>

      <div className="row g-4">
        {/* FORMULÁRIO */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header text-white">
              <h5 className="mb-0">
                <i
                  className={`bi ${
                    editingId ? "bi-pencil-square" : "bi-plus-circle"
                  } me-2`}
                />
                {editingId ? "Editar Lanche" : "Novo Lanche"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    className={getInputClass("nome")}
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Pipoca Grande"
                  />
                  {errors.nome && (
                    <div className="invalid-feedback">{errors.nome}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Descrição *</label>
                  <textarea
                    name="descricao"
                    className={getInputClass("descricao")}
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descreva o produto..."
                  />
                  {errors.descricao && (
                    <div className="invalid-feedback">{errors.descricao}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Categoria *</label>
                  <select
                    name="categoria"
                    className={getInputClass("categoria")}
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="Pipoca">Pipoca</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Doce">Doce</option>
                    <option value="Combo">Combo</option>
                  </select>
                  {errors.categoria && (
                    <div className="invalid-feedback">{errors.categoria}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="preco"
                    className={getInputClass("preco")}
                    value={formData.preco}
                    onChange={handleChange}
                    placeholder="15.00"
                  />
                  {errors.preco && (
                    <div className="invalid-feedback">{errors.preco}</div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn text-white flex-grow-1"
                    style={{
                      background:
                        "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
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

        {/* LISTAGEM */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-basket-fill me-2" />
                Lanches cadastrados ({lanches.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {lanches.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-basket-fill display-1 text-muted"></i>
                  <p className="text-muted mt-3">
                    Nenhum lanche cadastrado ainda.
                  </p>
                </div>
              ) : (
                <div className="row g-3 p-3">
                  {lanches.map((lanche) => (
                    <div className="col-md-6" key={lanche.id}>
                      <div
                        className={`card h-100 ${
                          editingId === lanche.id ? "editing" : ""
                        }`}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{lanche.nome}</h6>
                            <span
                              className={`badge bg-${getCorCategoria(
                                lanche.categoria
                              )}`}
                            >
                              <i
                                className={`bi ${getIconeCategoria(
                                  lanche.categoria
                                )} me-1`}
                              />
                              {lanche.categoria}
                            </span>
                          </div>
                          <p className="card-text text-muted small">
                            {lanche.descricao}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-5 fw-bold text-success">
                              R$ {lanche.preco.toFixed(2)}
                            </span>
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(lanche)}
                                title="Editar"
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(lanche.id)}
                                title="Excluir"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanchesPage;
