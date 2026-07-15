import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-dynamic-delete": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "as" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "nodemailer",
              message: "Importações de libs de terceiros devem passar por Adapters (ver ADR-0009). Use src/core/adapters/*.",
            },
          ],
          patterns: [
            {
              group: ["*Adapter", "*/adapters/*"],
              message: "Importações diretas de libs terceiras devem ser isoladas em Adapters (ver ADR-0009).",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "tests/**",
      "eslint.config.js",
      "vitest.config.ts",
      "frontend/**",
    ],
  }
);
