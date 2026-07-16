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
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/**",
      "eslint.config.js",
      "frontend/**",
      "functions/lib/**",
      "functions/node_modules/**",
      "scripts/**/*.mjs",
    ],
  }
);
