import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    ignores: [
      "build/",
      "node_modules",
      "**/*.config.js",
      "playwright-report/",
      "fileTransformer.mjs",
    ],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
