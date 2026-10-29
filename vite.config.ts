import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub Pages project sites are served from /<repo-name>/.
// If you rename the repository, change this one value (keep both slashes).
// For a user site (username.github.io) use "/" instead.
const BASE = "./";

export default defineConfig(({ command }) => ({
  base: BASE,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: { outDir: "dist" },
  server: { host: true },
  command,
}));
