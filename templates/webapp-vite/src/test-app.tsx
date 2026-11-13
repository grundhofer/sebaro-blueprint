import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { routes } from "./main";

/** For unit tests: the app at an address, with the routes main.tsx starts (or the ones given). */
export function renderApp(path: string, at: RouteObject[] = routes) {
  render(<RouterProvider router={createMemoryRouter(at, { initialEntries: [path] })} />);
}
