import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="mt-4">
      <div className="text-center mb-5">
        <h1
          className="display-4 fw-bold"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <i
            className="bi bi-camera-reels-fill me-3"
            style={{ color: "#8b5cf6", WebkitTextFillColor: "#8b5cf6" }}
          ></i>
          CineWeb
        </h1>
        <p className="lead text-muted">Sistema de Gerenciamento de Cinema</p>
      </div>

      <div className="row g-4 mb-5">
        {/* FILMES */}
        <div className="col-md-6 col-lg-3">
          <Link to="/filmes" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 card-hover">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-film display-1 text-primary" />
                </div>
                <h5
                  className="card-title"
                  style={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  Filmes
                </h5>
                <p className="card-text" style={{ color: "#cbd5e1" }}>
                  Cadastre e gerencie o catálogo de filmes em cartaz
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* SALAS */}
        <div className="col-md-6 col-lg-3">
          <Link to="/salas" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 card-hover">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-projector-fill display-1 text-success" />
                </div>
                <h5
                  className="card-title"
                  style={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  Salas
                </h5>
                <p className="card-text" style={{ color: "#cbd5e1" }}>
                  Defina as salas e suas capacidades de público
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* SESSÕES */}
        <div className="col-md-6 col-lg-3">
          <Link to="/sessoes" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 card-hover">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-clock-history display-1 text-warning" />
                </div>
                <h5
                  className="card-title"
                  style={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  Sessões
                </h5>
                <p className="card-text" style={{ color: "#cbd5e1" }}>
                  Agende sessões relacionando filmes e salas
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* VENDAS */}
        <div className="col-md-6 col-lg-3">
          <Link to="/vendas" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 card-hover">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="bi bi-cash-coin display-1 text-danger" />
                </div>
                <h5
                  className="card-title"
                  style={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  Vendas
                </h5>
                <p className="card-text" style={{ color: "#cbd5e1" }}>
                  Registre ingressos e lanches vendidos por sessão
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* LANCHES */}
        <div className="col-md-6 col-lg-3">
          <Link to="/lanches" className="text-decoration-none">
            <div className="card h-100 shadow-sm border-0 card-hover">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i
                    className="bi bi-basket-fill display-1"
                    style={{ color: "#ec4899" }}
                  />
                </div>
                <h5
                  className="card-title"
                  style={{ color: "#f8fafc", fontWeight: 600 }}
                >
                  Lanches
                </h5>
                <p className="card-text" style={{ color: "#cbd5e1" }}>
                  Cadastre lanches e combos da bomboniere
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
