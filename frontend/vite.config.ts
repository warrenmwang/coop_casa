import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src"),
      "@app/api": path.resolve(__dirname, "./src/api"),
      "@app/assets": path.resolve(__dirname, "./src/assets"),
      "@app/components": path.resolve(__dirname, "./src/components"),
      "@app/fonts": path.resolve(__dirname, "./src/fonts"),
      "@app/types": path.resolve(__dirname, "./src/types"),
      "@app/hooks": path.resolve(__dirname, "./src/hooks"),
      "@app/utils": path.resolve(__dirname, "./src/utils"),
      "@app/react-router": path.resolve(__dirname, "./src/react-router"),
      "@app/styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "build",
    target: "modules",
    modulePreload: true,
    sourcemap: true,
  },
});
