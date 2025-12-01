import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    proxy: {
      // 1. API 요청을 백엔드로 전달
      "/api": {
        target: "http://localhost:8080",
        // rewrite를 통해 '/api' 접두어를 제거하고 요청 (예: /api/sales-items -> /sales-items)
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
    },
  },
});