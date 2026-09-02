import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Payload-generated files. These are produced by
    // `payload migrate:create` / `payload generate:importmap` from a
    // fixed template and are regenerated verbatim on every schema
    // change — hand-editing them to satisfy lint would be undone the
    // next time, and their contents are Payload's contract, not ours.
    // (The template always destructures { db, payload, req } even when
    // a migration only uses `db`.)
    "src/migrations/**",
    "src/app/(payload)/admin/importMap.js",
  ]),
]);

export default eslintConfig;
