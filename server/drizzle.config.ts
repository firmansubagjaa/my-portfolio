// File: /server/drizzle.config.ts
import { defineConfig } from "drizzle-kit";

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
	throw new Error("DIRECT_URL wajib diisi untuk drizzle-kit");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: directUrl,
	},
	strict: true,
	verbose: true,
});
