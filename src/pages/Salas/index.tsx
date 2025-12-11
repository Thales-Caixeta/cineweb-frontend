import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { Sala } from "../../models/sala.model";
import { salaSchema } from "../../schemas/sala.schema";
import type { SalaFormData } from "../../schemas/sala.schema";
import {
  createSala,
  deleteSala,
  getSalas,
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

    try {
      const novaSala: Sala = {
        numero: formData.numero,
        capacidade: Number(formData.capacidade),
      };

      const criada = await createSala(novaSala);
      setSalas((prev) => [...prev, criada]);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar sala", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return;
    const confirmar = window.confirm("Deseja realmente excluir esta sala?");
    if (!confirmar) return;

    try {
      await deleteSala(id);
      setSalas((prev) => prev.filter((sala) => sala.id !== id));
    } catch (error) {
      console.error("Erro ao excluir sala", error);
    }
  }

  function getInputClass(field: keyof SalaFormData) {
    return errors[field] ? "form-control is-invalid" : "form-control";
  }

  return (
    <div className="mt-4">
      <h1 className="page-title">Salas</h1>
      <p className="page-subtitle">
        Cadastre as salas de exibição e suas capacidades.
      </p>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-plus-circle me-2" />
                Nova Sala
              </h5>

              <form onSubmit={handleSubmit} noValidate>
                {/* NÚMERO DA SALA (SELECT 1–10) */}
                <div className="mb-3">
                  <label className="form-label">Número da sala</label>
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
                    <option value="10">Sala 10</option>
                  </select>
                  {errors.numero && (
                    <div className="invalid-feedback">{errors.numero}</div>
                  )}
                </div>

                {/* CAPACIDADE */}
                <div className="mb-3">
                  <label className="form-label">Capacidade máxima</label>
                  <input
                    type="number"
                    name="capacidade"
                    className={getInputClass("capacidade")}
                    value={formData.capacidade}
                    onChange={handleChange}
                    min={1}
                  />
                  {errors.capacidade && (
                    <div className="invalid-feedback">{errors.capacidade}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Sala"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-door-open me-2" />
                Salas cadastradas
              </h5>

              {salas.length === 0 ? (
                <p className="text-muted mt-3">Nenhuma sala cadastrada.</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Capacidade</th>
                        <th style={{ width: "80px" }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salas.map((sala) => (
                        <tr key={sala.id}>
                          <td>{sala.numero}</td>
                          <td>{sala.capacidade}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(sala.id)}
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

export default SalasPage;
