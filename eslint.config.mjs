import path from "node:path";
import js from "@eslint/js";
import { ts as somniTs } from "@somni/eslint-config";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
  /* Shared common base configurations */
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ts.configs.recommended,
  ...somniTs,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off",
    },
  },

  /* Svelte (config-ui) configurations */
  svelte.configs.recommended,
  {
    files: [ "**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js" ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [ ".svelte" ],
        parser: ts.parser,
      },
    },
  },

  /* Shared overrides for all packages */
  {
    files: [ "**/*.ts", "**/*.js", "**/*.svelte" ],
    rules: {
      semi: [ "error", "always" ],
    },
  },
);
