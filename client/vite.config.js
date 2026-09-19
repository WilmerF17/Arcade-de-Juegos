import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" para que funcione igual en Vercel (/) y GitHub Pages (/repo/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
