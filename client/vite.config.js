import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" para que funcione igual en Vercel (/) y GitHub Pages (/repo/).
// __APP_VERSION__ y __BUILD_DATE__ se muestran en el lateral (versión visible).
export default defineConfig({
  base: "./",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "2.3.0"),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
