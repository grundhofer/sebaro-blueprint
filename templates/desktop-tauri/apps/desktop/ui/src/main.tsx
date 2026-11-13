// main.tsx: the entry. The one window with its error boundary, then the start.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import { App } from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorView } from "./components/ErrorView";

const failed = (
  <main className="sb-window__content">
    <ErrorView />
  </main>
);

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary fallback={failed}>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
