import js from "@eslint/js";
import tanstackPlugin from "@tanstack/eslint-plugin-query";
import typescript from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "build/",
      "node_modules",
      "**/*.config.js",
      "playwright-report/",
      "fileTransformer.mjs",
    ],
    plugins: {
      react: reactPlugin,
      "@tanstack/query": tanstackPlugin,
    },
    languageOptions: {
      parser: typescript,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "prefer-const": "error",
      "no-unused-vars": "warn",
      "no-console": "warn",
      // // Import organization rules
      // "sort-imports": [
      //   "error",
      //   {
      //     ignoreCase: true,
      //     ignoreDeclarationSort: true,
      //     ignoreMemberSort: false,
      //     memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      //   },
      // ],
      // Add other rules as needed
    },
  },
];
