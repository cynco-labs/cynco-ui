import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		// Tests and the docs demos import the package by name; resolve it to source so no build is needed.
		alias: [
			{ find: "@cynco-labs/ui/ai", replacement: src("ai.ts") },
			{ find: "@cynco-labs/ui", replacement: src("index.ts") },
		],
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./test/setup.ts"],
		include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
		testTimeout: 30_000,
	},
});
