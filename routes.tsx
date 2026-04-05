import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { VisaoGeral } from "./pages/VisaoGeral";
import { Caixa } from "./pages/Caixa";
import { Financeiro } from "./pages/Financeiro";
import { Producao } from "./pages/Producao";
import { Logistica } from "./pages/Logistica";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: VisaoGeral },
      { path: "caixa", Component: Caixa },
      { path: "financeiro", Component: Financeiro },
      { path: "producao", Component: Producao },
      { path: "logistica", Component: Logistica },
    ],
  },
]);