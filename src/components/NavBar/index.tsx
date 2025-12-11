import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          CineWeb
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/filmes">
                Filmes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/salas">
                Salas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/sessoes">
                Sessões
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/vendas">
                Vendas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/lanches">
                Lanches
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
