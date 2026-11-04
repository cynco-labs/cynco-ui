import { CommandPalette, type CommandPaletteItem, CommandPaletteTrigger } from "@cynco-labs/ui";
import { CubeIcon, FileTextIcon, SlidersIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { GITHUB } from "../lib/inline-md";
import { type SearchDoc, type SearchKind, search } from "../lib/search";

/** Results kept while the reader is typing; the whole index shows when the field is empty. */
const LIMIT = 50;

const ICONS: Record<SearchKind, ReactNode> = {
	guide: <FileTextIcon />,
	component: <CubeIcon />,
	action: <SlidersIcon />,
};

/** Site commands, so a leading ">" has something to narrow to. */
const ACTIONS: SearchDoc[] = [
	{
		id: "action/theme",
		kind: "action",
		title: "Toggle dark mode",
		href: "",
		group: "Actions",
		hint: "This site",
		terms: ["theme", "dark", "light", "appearance"],
		text: "",
	},
	{
		id: "action/github",
		kind: "action",
		title: "Open the repository on GitHub",
		href: GITHUB,
		group: "Actions",
		hint: "This site",
		terms: ["source", "git", "repository", "code"],
		text: "",
	},
];

function toggleTheme() {
	const dark = !document.documentElement.classList.contains("dark");
	document.documentElement.classList.toggle("dark", dark);
	localStorage.setItem("theme", dark ? "dark" : "light");
	window.dispatchEvent(new CustomEvent("site-theme", { detail: dark ? "dark" : "light" }));
}

/**
 * The site's ⌘K search: every component and guide, ranked by lib/search.ts and rendered by the
 * library's own CommandPalette. The sidebar's filter field stays as the fallback.
 */
export default function SearchPalette() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [docs, setDocs] = useState<SearchDoc[]>([]);

	useEffect(() => {
		const controller = new AbortController();
		fetch("/search.json", { signal: controller.signal })
			.then((r) => r.json() as Promise<{ docs: SearchDoc[] }>)
			.then((data) => setDocs(data.docs))
			.catch(() => undefined);
		return () => controller.abort();
	}, []);

	const items = useMemo<CommandPaletteItem[]>(() => {
		const pool = [...ACTIONS, ...docs];
		const hits = search(query, pool, query.trim() ? LIMIT : pool.length);
		return hits.map(({ doc }) => ({
			id: doc.id,
			group: doc.group,
			label: doc.title,
			// The palette scores items again. Handing it the query itself scores every row alike, so
			// what survives is the order above, which ranks a name match over a match in prose.
			keywords: [query],
			icon: ICONS[doc.kind],
			hint: doc.hint,
			href: doc.href || undefined,
		}));
	}, [docs, query]);

	return (
		// CommandPalette renders in a portal, but React events still bubble through the tree, so this
		// is how the input's value reaches the ranking above.
		<div
			className="contents"
			onInput={(e) => {
				if (e.target instanceof HTMLInputElement) setQuery(e.target.value);
			}}
		>
			<CommandPaletteTrigger
				label="Search docs…"
				onClick={() => setOpen(true)}
				className="hidden h-8 w-40 text-xs sm:flex lg:w-56"
			/>
			<CommandPalette
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) setQuery("");
				}}
				items={items}
				placeholder="Search components and guides…"
				onSelect={(item) => {
					if (item.id === "action/theme") toggleTheme();
					else if (item.href) location.href = item.href;
				}}
			/>
		</div>
	);
}
