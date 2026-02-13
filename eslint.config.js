import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default [
  // Global ignore patterns (migrated from .eslintignore)
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".git/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "out/**",
      ".eslintrc.js",
      "*.config.js",
      "*.config.mjs",
    ],
  },

  // Base JavaScript config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  // Next.js and custom rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // Custom rules
      semi: ["error", "always"],
      "@typescript-eslint/no-explicit-any": "warn",

      // Prettier integration
      "prettier/prettier": "error",
    },
  },
];
