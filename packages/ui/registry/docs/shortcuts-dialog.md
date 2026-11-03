# ShortcutsDialog

A searchable dialog listing every keyboard shortcut in sections, opened with “?”, plus useGoToShortcuts for two-key “g then i” navigation.

```tsx
import { ShortcutsDialog } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Fragment, useState } from "react";
import {
	Button,
	Kbd,
	ShortcutsDialog,
	useCharacterKeyShortcuts,
	useGoToShortcuts,
} from "@cynco-labs/ui";

// G then a letter goes to a page; C then a letter creates something. Keys are the letter after "g", or a full sequence.
const ROUTES = {
	d: "/dashboard",
	i: "/invoices",
	q: "/quotations",
	c: "/customers",
	v: "/vendors",
	b: "/banking",
	"c i": "/invoices/new",
	"c q": "/quotations/new",
	"c j": "/journal/new",
	"c c": "/customers/new",
};

const LABELS: Record<string, string> = {
	"/dashboard": "Dashboard",
	"/invoices": "Invoices",
	"/quotations": "Quotations",
	"/customers": "Customers",
	"/vendors": "Vendors",
	"/banking": "Banking",
	"/invoices/new": "New invoice",
	"/quotations/new": "New quotation",
	"/journal/new": "New journal entry",
	"/customers/new": "New customer",
};

/** The two-key sequences the page handles, as [keys, label]. */
const SEQUENCES: { title: string; items: [string, string][] }[] = [
	{
		title: "Go to",
		items: [
			["g d", "Dashboard"],
			["g i", "Invoices"],
			["g q", "Quotations"],
			["g c", "Customers"],
			["g b", "Banking"],
		],
	},
	{
		title: "Create",
		items: [
			["c i", "New invoice"],
			["c q", "New quotation"],
			["c j", "New journal entry"],
			["c c", "New customer"],
		],
	},
];

const SECTIONS = [
	{
		title: "Global",
		items: [
			{ keys: "mod+k", label: "Open command palette" },
			{ keys: "?", label: "Show keyboard shortcuts" },
			{ keys: "esc", label: "Close dialog or clear selection" },
		],
	},
	{
		title: "Go to",
		items: [
			{ keys: "g d", label: "Dashboard" },
			{ keys: "g i", label: "Invoices" },
			{ keys: "g q", label: "Quotations" },
			{ keys: "g c", label: "Customers" },
			{ keys: "g v", label: "Vendors" },
			{ keys: "g b", label: "Banking" },
		],
	},
	{
		title: "Create",
		items: [
			{ keys: "c i", label: "New invoice" },
			{ keys: "c q", label: "New quotation" },
			{ keys: "c j", label: "New journal entry" },
			{ keys: "c c", label: "New customer" },
		],
	},
	{
		title: "Lists",
		items: [
			{ keys: ["j", "down"], label: "Next row" },
			{ keys: ["k", "up"], label: "Previous row" },
			{ keys: "x", label: "Select row" },
			{ keys: "enter", label: "Open row" },
		],
	},
	{
		title: "Journal entry",
		items: [
			{ keys: "Tab", label: "Next cell" },
			{ keys: "alt+b", label: "Balance this line" },
			{ keys: "=", label: "Start a formula (=1200*1.08)", focusScoped: true },
			{ keys: "mod+enter", label: "Post entry" },
		],
	},
];

export default function ShortcutsDialogDemo() {
	const [open, setOpen] = useState(false);
	const [went, setWent] = useState<{ path: string; seq: string } | null>(null);
	// The user's single-key switch lives in the dialog's footer; it also gates "?" and G/C sequences.
	const [characterKeys] = useCharacterKeyShortcuts();
	const g = useGoToShortcuts(ROUTES, (path, seq) => {
		setWent({ path, seq });
	});
	return (
		<div className="@container flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="secondary"
					onClick={() => {
						setOpen(true);
					}}
				>
					{"Keyboard shortcuts"}
					{characterKeys && <Kbd keys="?" />}
				</Button>
				<span className="text-xs text-tertiary-foreground">
					{characterKeys ? (
						<>
							{"Try: "}
							<Kbd keys="?" />
							{" then type “journal”; or press "}
							<Kbd keys="g" />
							{" then "}
							<Kbd keys="i" />
							{" (click here first so the frame has focus)."}
						</>
					) : (
						"Single-key shortcuts are off. Turn them back on at the bottom of the Keyboard shortcuts dialog."
					)}
				</span>
			</div>
			<div
				className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm"
				aria-live="polite"
			>
				{g.pending ? (
					<>
						<Kbd keys={g.pending} />
						<span className="text-muted-foreground">
							{"… then "}
							<Kbd keys="d" /> <Kbd keys="i" /> <Kbd keys="q" /> <Kbd keys="c" /> <Kbd keys="v" />{" "}
							<Kbd keys="b" />
						</span>
					</>
				) : went ? (
					<>
						<span className="text-muted-foreground">Went to</span>
						<span className="font-medium text-foreground">{LABELS[went.path] || went.path}</span>
						<span className="font-mono text-xs text-tertiary-foreground">{went.path}</span>
					</>
				) : characterKeys ? (
					<span className="text-tertiary-foreground">
						Waiting for a sequence: G then D, I, Q, C, V, B — or C then I, Q, J, C.
					</span>
				) : (
					<span className="text-tertiary-foreground">Sequences are off.</span>
				)}
			</div>
			<div className="grid gap-3 @md:grid-cols-2">
				{SEQUENCES.map((group) => (
					<div key={group.title} className="rounded-xl border border-border bg-card px-3 py-2">
						<div className="mb-1 text-xs font-medium text-tertiary-foreground">{group.title}</div>
						{group.items.map(([keys, label]) => (
							<div
								key={keys}
								className="flex items-center justify-between gap-3 border-b border-table-row-divider py-1.5 text-sm text-foreground last:border-0"
							>
								<span>{label}</span>
								<span className="flex gap-1">
									{keys.split(" ").map((k, i) => (
										<Kbd key={i} keys={k} />
									))}
								</span>
							</div>
						))}
					</div>
				))}
			</div>
			<ShortcutsDialog open={open} onOpenChange={setOpen} sections={SECTIONS} />
		</div>
	);
}
```

## Use

Mount once in the app shell. Pass your app's sections (Global, Go to, Create, Lists…). Call useGoToShortcuts(routes, navigate) in the shell with your own route map, e.g. { i: "/invoices", "c j": "/journal/new" }, so G then I opens Invoices and C then J starts a journal entry.

## Props

ShortcutsDialog: open / defaultOpen / onOpenChange; sections ([{title, items: [{keys, label}]}], keys like "mod+enter", "g i" for a sequence, or an array of alternatives); hotkey (default "?", false to bind your own); title; className. useGoToShortcuts(map, navigate, {enabled, timeout = 1200 ms, leader = "g"}): map keys are a letter after the leader or a full sequence ("c i"); returns {pending} so you can show “G…” while it waits. Items take an optional focusScoped: true for keys that only fire inside their own field (never shown as off). KeyboardShortcutsProvider (characterKeys / defaultCharacterKeys = true / onCharacterKeysChange) and useCharacterKeyShortcuts() → [enabled, setEnabled] control the single-key switch; isCharacterKeyShortcut(keys) tells you whether your own shortcut should honour it.

- `sections`: `ShortcutsDialogSection[]`. Your shortcuts, grouped. The single-key switch is always shown under them.
- `open?`: `boolean`
- `defaultOpen?`: `boolean`. Default `false`.
- `onOpenChange?`: `(open: boolean) => void`
- `hotkey?`: `string | false | string[]`. Key that opens the sheet. Default "?" (Shift+/); `false` to bind your own. Default `"?"`.
- `title?`: `string`. Default `"Keyboard shortcuts"`.

## Notes

Keys: “?” opens (never while typing), type to filter by label, key or section, Esc closes and returns focus. Sequences are ignored while typing, inside dialogs and menus, and with ⌘/Ctrl/Alt held; any other key or the timeout cancels. Sections flow into two columns once the dialog is 36rem wide. WCAG 2.1.4: the footer has a “Single-key shortcuts” switch. Off unbinds “?”, every useGoToShortcuts sequence and bare-letter ShortcutButtons, and marks those rows Off; ⌘/Ctrl chords and named keys are unaffected. With no provider the choice is saved in localStorage (cy-character-key-shortcuts) and syncs across tabs; pass characterKeys to store it yourself. When it is off, the dialog opens from the command palette or a button. Gate your own printable-only page shortcuts on useCharacterKeyShortcuts().

Category: Productivity. Source: `packages/ui/src/productivity/navigation.tsx`.
