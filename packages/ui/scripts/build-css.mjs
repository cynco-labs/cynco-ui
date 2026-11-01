// Copies the Tailwind theme sources to dist/styles and compiles a standalone stylesheet (dist/styles.css)
// for apps that don't use Tailwind.
import { cpSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

mkdirSync("dist/styles", { recursive: true });
cpSync("src/styles", "dist/styles", { recursive: true });
writeFileSync("dist/styles/standalone.css", '@import "tailwindcss";\n@import "./theme.css";\n');
execFileSync("npx", ["@tailwindcss/cli", "-i", "dist/styles/standalone.css", "-o", "dist/styles.css", "--minify"], { stdio: "inherit" });
