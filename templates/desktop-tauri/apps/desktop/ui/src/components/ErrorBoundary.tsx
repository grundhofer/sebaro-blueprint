import { Component, type ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode };

/** Catches a part that fails while it draws: the fallback stands in its place and the rest of the window stays.
 *  React asks for a class here; it has no hook for this. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
