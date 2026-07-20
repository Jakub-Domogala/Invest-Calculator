import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from /Invest-Calculator/, but the dev
  // server should stay at the root so local URLs remain simple.
  base: command === "build" ? "/Invest-Calculator/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
