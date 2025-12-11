import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home";
import FilmesPage from "../pages/Filmes";
import SalasPage from "../pages/Salas";
import SessoesPage from "../pages/Sessoes";
import VendasPage from "../pages/Vendas";
import LanchesPage from "../pages/Lanches";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/filmes" element={<FilmesPage />} />
      <Route path="/salas" element={<SalasPage />} />
      <Route path="/sessoes" element={<SessoesPage />} />
      <Route path="/vendas" element={<VendasPage />} />
      <Route path="/lanches" element={<LanchesPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
