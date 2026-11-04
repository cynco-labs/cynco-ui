import { basename } from "node:path";
import type { LibraryId } from "./types.ts";

/** One thing the harness does to a fresh copy of the template; the agent never installs the library itself. */
export type Step =
	| { kind: "run"; cmd: string; args: string[] }
	| { kind: "write"; path: string; content: string }
	| { kind: "copy"; from: string; to: string }
	/** Fails when `find` is missing, so a change in a library's generated files stops the run instead of drifting. */
	| { kind: "edit"; path: string; find: string; replace: string };

export interface SetupContext {
	/** Absolute path of the packed local build when the run uses `--cynco local`. */
	cyncoTarball: string | null;
}

export interface Library {
	id: LibraryId;
	label: string;
	docsUrl: string;
	/** The one line every arm gets as its project CLAUDE.md. */
	claudeMd: string;
	/** Lower-case names that identify this library; no other arm's harness-written text may contain them. */
	names: string[];
	/** Installed packages whose versions are recorded with the run. */
	packages: string[];
	/** Source directories the library's CLI writes into, left out of the source scan. */
	ownedDirs: string[];
	/** Matches the module specifier of an import from the library. */
	importPattern: RegExp;
	/** Matches a shell command that reads the library's docs. */
	docsCommand: RegExp;
	/** Paths an agent reads for the library's docs, besides `.claude/skills`. */
	docsPaths: string[];
	setup: (ctx: SetupContext) => Step[];
	/** What the harness adds to a copy of the base to prove one library component renders. */
	probe: { steps: Step[]; app: string };
}

const npx = (...args: string[]): Step => ({ kind: "run", cmd: "npx", args: ["-y", ...args] });
const npmInstall = (...packages: string[]): Step => ({
	kind: "run",
	cmd: "npm",
	args: ["install", "--no-audit", "--no-fund", ...packages],
});
const skillsAdd = (source: string, skill: string): Step =>
	npx("skills@latest", "add", source, "--skill", skill, "--agent", "claude-code", "--yes", "--copy");
const shadcnInit = npx(
	"shadcn@latest",
	"init",
	"--template",
	"vite",
	"--base",
	"base",
	"--defaults",
	"--yes",
	"--no-monorepo",
);

const probeApp = (importLine: string, element: string) =>
	`${importLine}\n\nexport default function App() {\n\treturn (\n\t\t<main className="p-6">\n\t\t\t${element}\n\t\t</main>\n\t);\n}\n`;

const SHADCN_OWNED = ["src/components/ui", "src/lib", "src/hooks"];
const SHADCN_IMPORT = /(^|\/)components\/ui\//;
const SHADCN_DOCS = /\bshadcn(@\S+)?\s+(docs|search|view|info|list)\b/;

export const LIBRARIES: Record<LibraryId, Library> = {
	cynco: {
		id: "cynco",
		label: "Cynco UI",
		docsUrl: "https://ui.cynco.io",
		claudeMd: "This app's UI is built with Cynco UI (@cynco-labs/ui). Docs: https://ui.cynco.io",
		names: ["cynco"],
		packages: ["@cynco-labs/ui", "@phosphor-icons/react"],
		ownedDirs: [],
		importPattern: /^@cynco-labs\/ui/,
		docsCommand: /\bcynco-ui\s+(search|docs|list)\b/,
		docsPaths: ["node_modules/@cynco-labs/ui/"],
		setup: ({ cyncoTarball }) => {
			// The tarball lives inside the project so a clone keeps working and package.json shows no outside path.
			const vendored = cyncoTarball ? `vendor/${basename(cyncoTarball)}` : null;
			const install: Step[] =
				cyncoTarball && vendored
					? [{ kind: "copy", from: cyncoTarball, to: vendored }, npmInstall(`./${vendored}`, "@phosphor-icons/react")]
					: [npmInstall("@cynco-labs/ui", "@phosphor-icons/react")];
			return [
				...install,
				{
					kind: "write",
					path: "src/index.css",
					content: `@import "tailwindcss";\n@import "@cynco-labs/ui/fonts.css";\n@import "@cynco-labs/ui/theme.css";\n`,
				},
				{
					kind: "edit",
					path: "src/main.tsx",
					find: "\t\t<App />\n",
					replace: "\t\t<TooltipProvider>\n\t\t\t<App />\n\t\t</TooltipProvider>\n",
				},
				{
					kind: "edit",
					path: "src/main.tsx",
					find: `import { StrictMode } from "react";\n`,
					replace: `import { TooltipProvider } from "@cynco-labs/ui";\nimport { StrictMode } from "react";\n`,
				},
				npx("cynco-ui", "skill"),
			];
		},
		probe: { steps: [], app: probeApp(`import { Button } from "@cynco-labs/ui";`, "<Button>Save changes</Button>") },
	},
	kumo: {
		id: "kumo",
		label: "Kumo",
		docsUrl: "https://kumo-ui.com",
		claudeMd: "This app's UI is built with Kumo (@cloudflare/kumo). Docs: https://kumo-ui.com",
		names: ["kumo"],
		packages: ["@cloudflare/kumo", "@phosphor-icons/react"],
		ownedDirs: [],
		importPattern: /^@cloudflare\/kumo/,
		docsCommand: /\bkumo\s+(doc|docs|ls|ai|blocks)\b/,
		docsPaths: ["node_modules/@cloudflare/kumo/"],
		setup: () => [
			npmInstall("@cloudflare/kumo", "@phosphor-icons/react"),
			{
				kind: "write",
				path: "src/index.css",
				content: `@source "../node_modules/@cloudflare/kumo/dist/**/*.{js,jsx,ts,tsx}";\n@import "@cloudflare/kumo/styles/tailwind";\n@import "tailwindcss";\n\n#root {\n\tisolation: isolate;\n}\n`,
			},
		],
		probe: {
			steps: [],
			app: probeApp(`import { Button } from "@cloudflare/kumo";`, `<Button variant="primary">Save changes</Button>`),
		},
	},
	shadcn: {
		id: "shadcn",
		label: "shadcn/ui",
		docsUrl: "https://ui.shadcn.com",
		claudeMd: "This app's UI is built with shadcn/ui on Base UI. Docs: https://ui.shadcn.com",
		names: ["shadcn"],
		packages: ["shadcn", "@base-ui/react", "lucide-react"],
		ownedDirs: SHADCN_OWNED,
		importPattern: SHADCN_IMPORT,
		docsCommand: SHADCN_DOCS,
		docsPaths: ["node_modules/shadcn/", "node_modules/@base-ui/react/"],
		setup: () => [shadcnInit, skillsAdd("shadcn/ui", "shadcn")],
		probe: {
			steps: [],
			app: probeApp(`import { Button } from "@/components/ui/button";`, "<Button>Save changes</Button>"),
		},
	},
	fluid: {
		id: "fluid",
		label: "Fluid Functionalism",
		docsUrl: "https://www.fluidfunctionalism.com",
		claudeMd:
			"This app's UI is built with Fluid Functionalism (Base UI flavour, the @fluid registry). Docs: https://www.fluidfunctionalism.com",
		names: ["fluid functionalism", "@fluid", "fluidfunctionalism"],
		packages: ["shadcn", "@base-ui/react", "motion", "@fontsource-variable/inter"],
		ownedDirs: SHADCN_OWNED,
		importPattern: SHADCN_IMPORT,
		docsCommand: SHADCN_DOCS,
		docsPaths: ["node_modules/shadcn/", "node_modules/@base-ui/react/"],
		setup: () => [
			shadcnInit,
			npx("shadcn@latest", "registry", "add", "@fluid"),
			npmInstall("motion", "@fontsource-variable/inter"),
			// Fluid animates weight together with Inter's optical-size axis, so labels get bolder without getting wider.
			{
				kind: "edit",
				path: "src/index.css",
				find: `@import "@fontsource-variable/geist";`,
				replace: `@import "@fontsource-variable/inter/opsz.css";`,
			},
			{ kind: "edit", path: "src/index.css", find: "'Geist Variable'", replace: "'Inter Variable'" },
			skillsAdd("https://github.com/mickadesign/fluid-functionalism", "fluid-functionalism"),
		],
		probe: {
			steps: [npx("shadcn@latest", "add", "@fluid/base/button", "--overwrite")],
			app: probeApp(`import { Button } from "@/components/ui/button";`, "<Button>Save changes</Button>"),
		},
	},
};

export const otherLibraryNames = (id: LibraryId): string[] =>
	Object.values(LIBRARIES)
		.filter((library) => library.id !== id)
		.flatMap((library) => library.names);

export const allLibraryNames = (): string[] => Object.values(LIBRARIES).flatMap((library) => library.names);
