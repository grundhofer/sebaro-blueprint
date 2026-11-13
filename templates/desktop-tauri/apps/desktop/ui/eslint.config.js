// eslint.config.js: ESLint with typescript-eslint and the rules of React's hooks. Beside the recommended rules: no
// promise left unhandled, no `any`, no console, and no word written into JSX.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const WORD = "Every word comes from the string tables (i18n/ at the root of the repository): use t() or <Trans>.";

export default defineConfig(
  // the sebaro copy is never edited and the bindings are generated from the Rust commands, so neither is linted
  globalIgnores(["dist", "src/sebaro", "src/ipc/bindings.ts", "test-results", "playwright-report"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "error",
    },
  },
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        // text between tags, and a string in braces between tags; signs and numbers alone are values
        { selector: "JSXText[value=/\\p{L}/u]", message: WORD },
        {
          selector: ":matches(JSXElement, JSXFragment) > JSXExpressionContainer > Literal[value=/\\p{L}/u]",
          message: WORD,
        },
        // the attributes a person reads or hears
        {
          selector: "JSXAttribute[name.name=/^(aria-label|aria-description|alt|placeholder|title)$/] > Literal",
          message: WORD,
        },
      ],
    },
  },
);
