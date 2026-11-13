// main.tsx: the entry. The one window with its error boundary; once it has painted, the start ends.
import { StrictMode, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import { App } from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorView } from "./components/ErrorView";
import { endStart } from "./lib/start";

const failed = (
  <main className="sb-window__content">
    <ErrorView />
  </main>
);

/** Ends the start once the window, or what stands for it after an error, has painted. */
function Start({ children }: { children: ReactNode }) {
  useEffect(endStart, []);
  return children;
}

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Start>
        <ErrorBoundary fallback={failed}>
          <App />
        </ErrorBoundary>
      </Start>
    </StrictMode>,
  );
}
