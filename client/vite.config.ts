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
		},
		dedupe: ["zod", "react", "react-dom"],
		extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
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
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (
						id.includes("node_modules/@uiw") ||
						id.includes("pages/admin/LoginPage") ||
						id.includes("pages/admin/DashboardPage") ||
						id.includes("pages/admin/ProjectEditorPage")
					) {
						return "admin";
					}
				},
			},
		},
		minify: "esbuild",
	},
});
