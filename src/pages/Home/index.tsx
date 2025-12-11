function HomePage() {
  return (
    <div className="mt-4">
      <h1 className="page-title">Dashboard CineWeb</h1>
      <p className="page-subtitle">
        Use o menu acima para administrar filmes, salas, sessões, vendas de
        ingressos e lanches.
      </p>

      <div className="row mt-4 g-3">
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-film me-2" />
                Filmes
              </h5>
              <p className="card-text">
                Cadastre e gerencie o catálogo de filmes em cartaz.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-door-open me-2" />
                Salas
              </h5>
              <p className="card-text">
                Defina as salas e suas capacidades de público.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-calendar-event me-2" />
                Sessões
              </h5>
              <p className="card-text">
                Agende sessões relacionando filmes e salas.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-cart-check me-2" />
                Vendas
              </h5>
              <p className="card-text">
                Registre ingressos e lanches vendidos por sessão.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
