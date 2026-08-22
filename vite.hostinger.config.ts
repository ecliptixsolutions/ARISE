import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  build: {
    outDir: "hostinger-build",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(root, "index.hostinger.html"),
      },
    },
  },
}));
