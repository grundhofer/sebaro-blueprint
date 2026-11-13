// main.tsx: the entry. The routes with their error boundary, then the start.
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./i18n";
import { ErrorView } from "./components/ErrorView";
import { Shell } from "./components/Shell";
import { List } from "./pages/List";

// what the start does not need is loaded when its route opens
const Detail = lazy(() => import("./pages/Detail"));
const EntryForm = lazy(() => import("./pages/EntryForm"));
const Settings = lazy(() => import("./pages/Settings"));
const DataTypes = lazy(() => import("./pages/DataTypes"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const views: RouteObject[] = [
  { index: true, element: <List /> },
  { path: "eintrag/:id", element: <Detail /> },
  { path: "neu", element: <EntryForm /> },
  { path: "bearbeiten/:id", element: <EntryForm /> },
  { path: "einstellungen", element: <Settings /> },
  { path: "daten", element: <DataTypes /> },
  { path: "impressum", element: <Legal page="impressum" /> },
  { path: "datenschutz", element: <Legal page="datenschutz" /> },
  { path: "barrierefreiheit", element: <Legal page="barrierefreiheit" /> },
  { path: "*", element: <NotFound /> },
];

// every route has an error boundary: a view that fails leaves the shell standing
export const routes: RouteObject[] = [
  {
    element: <Shell />,
    errorElement: <ErrorView />,
    children: views.map((view) => ({ ...view, errorElement: <ErrorView /> })),
  },
];

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={createBrowserRouter(routes)} />
    </StrictMode>,
  );
}
