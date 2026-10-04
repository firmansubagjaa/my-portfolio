import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "src"),
			"@shared": path.resolve(import.meta.dirname, "../server/src/shared"),
			// See src/lib/debug-shim.ts
			debug: path.resolve(import.meta.dirname, "src/lib/debug-shim.ts"),
		},
		dedupe: ["zod", "react", "react-dom"],
		// TS sources first so a stray compiled .js next to a .ts can never shadow it
		extensions: [".tsx", ".ts", ".jsx", ".mjs", ".js", ".json"],
	},
	server: {
		proxy: {
			"/api/v1": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	build: {
		// No manualChunks: route-level `lazy` imports in src/router give each admin page,
		// the detail page (markdown) and Shiki their own chunks automatically.
		target: "es2022",
		sourcemap: false,
	},
});
