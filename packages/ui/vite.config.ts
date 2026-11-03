import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];

const DIRECTIVE = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/;
const CLIENT_ONLY = /\b(?:React\.)?(?:use[A-Z]\w*|createContext)\(|\son[A-Z]\w*=\{/;
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");

/**
 * Rollup drops module-level directives, so React Server Components would treat every module as server code.
 * Each source module that starts with "use client" gets it back on its output file; a module that uses hooks,
 * context or event handlers without the directive fails the build.
 */
function useClientDirectives(): Plugin {
	const clientModules = new Set<string>();
	return {
		name: "cynco:use-client",
		enforce: "pre",
		transform(code, id) {
			if (!/\/src\/.*\.tsx?$/.test(id) || id.endsWith(".d.ts")) return;
			clientModules.delete(id);
			if (DIRECTIVE.test(code)) clientModules.add(id);
			else if (CLIENT_ONLY.test(stripComments(code))) this.error(`${id} uses hooks, context or event handlers: add "use client" as its first line.`);
		},
		banner: (chunk) => (chunk.facadeModuleId && clientModules.has(chunk.facadeModuleId) ? '"use client";' : ""),
	};
}

export default defineConfig({
	plugins: [react(), useClientDirectives()],
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
