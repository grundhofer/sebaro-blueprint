// main.tsx: the entry. The routes with their error boundary, then the start.
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./i18n";
import { ErrorView } from "./components/ErrorView";
import { Shell, type Place } from "./components/Shell";

// what the start does not need is loaded when its route opens
const Detail = lazy(() => import("./pages/Detail"));
const EntryForm = lazy(() => import("./pages/EntryForm"));
const Settings = lazy(() => import("./pages/Settings"));
const DataTypes = lazy(() => import("./pages/DataTypes"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

// `handle` says where a view stands in the app frame: its top-level place, and whether it is a sub-view of it
const inList: Place = { place: "/", sub: true };
const inSettings: Place = { place: "/einstellungen", sub: true };

const views: RouteObject[] = [
  // the list itself stands in the shell, so it stays while an entry or the form is open beside it
  { index: true, handle: { place: "/" } satisfies Place },
  { path: "eintrag/:id", element: <Detail />, handle: inList },
  { path: "neu", element: <EntryForm />, handle: inList },
  { path: "bearbeiten/:id", element: <EntryForm />, handle: inList },
  { path: "einstellungen", element: <Settings />, handle: { place: "/einstellungen" } satisfies Place },
  { path: "daten", element: <DataTypes />, handle: { place: "/daten" } satisfies Place },
  { path: "impressum", element: <Legal page="impressum" />, handle: inSettings },
  { path: "datenschutz", element: <Legal page="datenschutz" />, handle: inSettings },
  { path: "barrierefreiheit", element: <Legal page="barrierefreiheit" />, handle: inSettings },
  { path: "*", element: <NotFound /> },
];

// every route has an error boundary: a view that fails leaves the shell standing, a sub-view keeps its way back
export const routes: RouteObject[] = [
  {
    element: <Shell />,
    errorElement: <ErrorView />,
    children: views.map((view) => {
      const { place, sub }: Place = view.handle ?? {};
      return { ...view, errorElement: <ErrorView back={sub ? place : undefined} /> };
    }),
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
