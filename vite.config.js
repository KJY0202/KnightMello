import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/KnightMello/",
  plugins: [react()],
  build: {
    outDir: "docs",
  },
});
