import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Sala } from "../../models/sala.model";
import { salaSchema } from "../../schemas/sala.schema";
import type { SalaFormData } from "../../schemas/sala.schema";
import {
  createSala,
  deleteSala,
  getSalas,
  updateSala,
} from "../../services/cinewebApi.service";

type SalaFormErrors = Partial<Record<keyof SalaFormData, string>>;

const initialForm: SalaFormData = {
  numero: "",
  capacidade: "",
};

function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [formData, setFormData] = useState<SalaFormData>(initialForm);
  const [errors, setErrors] = useState<SalaFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  useEffect(() => {
    loadSalas();
  }, []);

  async function loadSalas() {
    try {
      const data = await getSalas();
      setSalas(data);
    } catch (error) {
      console.error("Erro ao carregar salas", error);
    }
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData(initialForm);
    setErrors({});
    setEditingId(null);
  }

  function handleEdit(sala: Sala) {
    setFormData({
      numero: String(sala.numero),
      capacidade: String(sala.capacidade),
    });
    setEditingId(sala.id!);
    setErrors({});

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = salaSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: SalaFormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof SalaFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Verificar se já existe uma sala com esse número
    const salaExistente = salas.find(
      (s) => String(s.numero) === String(formData.numero) && s.id !== editingId
    );

    if (salaExistente) {
      setErrors({
        numero: `A Sala ${formData.numero} já está cadastrada!`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const salaData: Sala = {
        numero: formData.numero,
        capacidade: Number(formData.capacidade),
      };

      if (editingId) {
        // EDITANDO
        const atualizada = await updateSala(editingId, salaData);
        setSalas((prev) =>
          prev.map((s) => (s.id === editingId ? atualizada : s))
        );
        alert("Sala atualizada com sucesso!");
      } else {
        // CRIANDO
        const criada = await createSala(salaData);
        setSalas((prev) => [...prev, criada]);
        alert("Sala cadastrada com sucesso!");
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar sala", error);
      alert("Erro ao salvar sala!");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id?: number | string) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir esta sala?");
    if (!confirmar) return;

    try {
      await deleteSala(id);
      setSalas((prev) => prev.filter((sala) => sala.id !== id));

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao excluir sala", error);
    }
  }

  function getInputClass(field: keyof SalaFormData) {
    return errors[field] ? "form-control is-invalid" : "form-control";
  }

  function getSalaColor(numero: string) {
    const cores = {
      "1": {
        border: "#10b981",
        icon: "#10b981",
        bg: "rgba(16, 185, 129, 0.1)",
      }, // Verde
      "2": {
        border: "#3b82f6",
        icon: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.1)",
      }, // Azul
      "3": {
        border: "#f59e0b",
        icon: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
      }, // Laranja
      "4": {
        border: "#ec4899",
        icon: "#ec4899",
        bg: "rgba(236, 72, 153, 0.1)",
      }, // Rosa
      "5": {
        border: "#8b5cf6",
        icon: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.1)",
      }, // Roxo
      "6": { border: "#06b6d4", icon: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)" }, // Ciano
      "7": { border: "#ef4444", icon: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }, // Vermelho
      "8": {
        border: "#14b8a6",
        icon: "#14b8a6",
        bg: "rgba(20, 184, 166, 0.1)",
      }, // Teal
      "9": {
        border: "#f97316",
        icon: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
      }, // Laranja escuro
    };
    return cores[numero as keyof typeof cores] || cores["1"];
  }

  return (
    <div className="mt-4 salas-page">
      <style>{`
        .salas-page .card-header::before {
          background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%) !important;
        }
        .salas-page .card.editing {
          background-color: rgba(16, 185, 129, 0.15) !important;
          border-color: rgba(16, 185, 129, 0.8) !important;
          border-width: 3px !important;
        }
      `}</style>

      <h1 className="page-title">Salas</h1>
      <p className="page-subtitle">
        Cadastre as salas de exibição e suas capacidades.
      </p>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header text-white">
              <h5 className="mb-0">
                <i
                  className={`bi ${
                    editingId ? "bi-pencil-square" : "bi-plus-circle"
                  } me-2`}
                />
                {editingId ? "Editar Sala" : "Nova Sala"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-bold">Número da Sala *</label>
                  <select
                    name="numero"
                    className={getInputClass("numero")}
                    value={formData.numero}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="1">Sala 1</option>
                    <option value="2">Sala 2</option>
                    <option value="3">Sala 3</option>
                    <option value="4">Sala 4</option>
                    <option value="5">Sala 5</option>
                    <option value="6">Sala 6</option>
                    <option value="7">Sala 7</option>
                    <option value="8">Sala 8</option>
                    <option value="9">Sala 9</option>
                  </select>
                  {errors.numero && (
                    <div className="invalid-feedback">{errors.numero}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Capacidade da Sala *
                  </label>
                  <select
                    name="capacidade"
                    className={getInputClass("capacidade")}
                    value={formData.capacidade}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="40">
                      Pequena - 40 lugares (5 por fileira)
                    </option>
                    <option value="64">
                      Média - 64 lugares (8 por fileira)
                    </option>
                    <option value="80">
                      Média+ - 80 lugares (10 por fileira)
                    </option>
                    <option value="96">
                      Grande - 96 lugares (12 por fileira)
                    </option>
                    <option value="112">
                      Grande+ - 112 lugares (14 por fileira)
                    </option>
                    <option value="128">
                      Extra Grande - 128 lugares (16 por fileira)
                    </option>
                    <option value="160">
                      Premium - 160 lugares (20 por fileira)
                    </option>
                  </select>
                  {errors.capacidade && (
                    <div className="invalid-feedback">{errors.capacidade}</div>
                  )}
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Escolha o tamanho da sala (distribuição otimizada em 8
                    fileiras)
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn text-white flex-grow-1"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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

        <div className="col-lg-8">
          <div className="row g-3">
            {salas.length === 0 ? (
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-projector-fill display-1 text-muted"></i>
                    <p className="text-muted mt-3 mb-0">
                      Nenhuma sala cadastrada ainda.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              salas.map((sala) => (
                <div className="col-md-6 col-lg-4" key={sala.id}>
                  <div
                    className={`card shadow-sm h-100 border-2 ${
                      editingId === sala.id ? "editing" : ""
                    }`}
                    style={{
                      borderColor: getSalaColor(sala.numero).border,
                      backgroundColor: getSalaColor(sala.numero).bg,
                    }}
                  >
                    <div className="card-body text-center">
                      <div className="mb-3">
                        <i
                          className="bi bi-projector-fill display-1"
                          style={{ color: getSalaColor(sala.numero).icon }}
                        ></i>
                      </div>
                      <h4 className="mb-3">Sala {sala.numero}</h4>
                      <div className="d-flex justify-content-center align-items-center mb-3">
                        <i className="bi bi-people-fill text-muted me-2"></i>
                        <span className="fs-5 fw-bold">
                          {sala.capacidade} lugares
                        </span>
                      </div>
                      <div className="btn-group w-100">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(sala)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(sala.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalasPage;
