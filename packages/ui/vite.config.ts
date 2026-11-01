import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];

export default defineConfig({
	plugins: [react()],
	build: {
		lib: { entry: { index: "src/index.ts", ai: "src/ai.ts" }, formats: ["es"] },
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			// Every dependency stays external (including deep imports like "@base-ui/react/menu").
			external: (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`)) || id.startsWith("react/") || id.startsWith("react-dom/"),
			// One file per module so apps only ship what they import.
			output: { preserveModules: true, preserveModulesRoot: "src", entryFileNames: "[name].js" },
		},
	},
});
