// Playwright: Chromium only, against the built UI (dist/) served by `vite preview`. Build first: pnpm build.
// Tauri's own webviews (WebKit on macOS and Linux, WebView2 on Windows) are not tested here.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  timeout: 60_000,
  // the UI speaks the language of the system: German here, English where a test asks for it
  use: { baseURL: "http://127.0.0.1:4174", browserName: "chromium", locale: "de-DE" },
  webServer: {
    command: "pnpm preview",
    url: "http://127.0.0.1:4174",
    // with CI=1 a busy port fails the run instead of testing whatever answers there
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
