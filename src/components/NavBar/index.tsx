import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg border-bottom border-primary"
      style={{ borderBottomWidth: "3px" }}
    >
      <div className="container-fluid px-4">
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/"
        >
          <i
            className="bi bi-camera-reels-fill me-2"
            style={{ fontSize: "1.5rem" }}
          ></i>
          <span style={{ fontSize: "1.25rem", letterSpacing: "0.5px" }}>
            CineWeb
          </span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cineweb-navbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="cineweb-navbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${isActive ? "active" : ""}`
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: "#8b5cf6" } : {}
                }
                to="/"
              >
                <i className="bi bi-house-fill me-2"></i>
                Início
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${
                    isActive ? "active bg-primary" : ""
                  }`
                }
                to="/filmes"
              >
                <i className="bi bi-film me-2"></i>
                Filmes
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${
                    isActive ? "active bg-success" : ""
                  }`
                }
                to="/salas"
              >
                <i className="bi bi-projector-fill me-2"></i>
                Salas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${
                    isActive ? "active bg-warning" : ""
                  }`
                }
                to="/sessoes"
              >
                <i className="bi bi-clock-history me-2"></i>
                Sessões
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${
                    isActive ? "active bg-danger" : ""
                  }`
                }
                to="/vendas"
              >
                <i className="bi bi-cash-coin me-2"></i>
                Vendas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded ${isActive ? "active" : ""}`
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: "#ec4899" } : {}
                }
                to="/lanches"
              >
                <i className="bi bi-basket-fill me-2"></i>
                Lanches
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
