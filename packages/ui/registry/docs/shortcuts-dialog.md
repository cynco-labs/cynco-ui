# ShortcutsDialog

A searchable dialog listing every keyboard shortcut in sections, opened with “?”, plus useGoToShortcuts for two-key “g then i” navigation.

```tsx
import { ShortcutsDialog } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Fragment, useState } from "react";
import { Button, CYNCO_GOTO_ROUTES, Kbd, ShortcutsDialog, useGoToShortcuts } from "@cynco-labs/ui";

const LABELS = {
	"/dashboard": "Dashboard",
	"/dashboard/invoicing": "Invoices",
	"/dashboard/quotations": "Quotations",
	"/dashboard/customers": "Customers",
	"/dashboard/vendors": "Vendors",
	"/dashboard/banking": "Banking",
	"/dashboard/accounting": "Accounting workbench",
	"/dashboard/dataroom": "Data room",
	"/dashboard/invoicing-new": "New invoice",
	"/dashboard/quotations-new": "New quotation",
	"/dashboard/accounting/journal/new": "New journal entry",
	"/dashboard/customers?action=create": "New customer",
};

export default function ShortcutsDialogDemo() {
	const [open, setOpen] = useState(false);
	const [went, setWent] = useState(null);
	const g = useGoToShortcuts(CYNCO_GOTO_ROUTES, (path, seq) => {
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
					{"Keyboard shortcuts "}
					<Kbd keys="?" />
				</Button>
				<span className="text-xs text-tertiary-foreground">
					{"Try: "}
					<Kbd keys="?" />
					{" then type “journal”; or press "}
					<Kbd keys="g" />
					{" then "}
					<Kbd keys="i" />
					{" (click here first so the frame has focus)."}
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
				) : (
					<span className="text-tertiary-foreground">
						Waiting for a sequence: G then D, I, Q, C, V, B — or C then I, Q, J, C.
					</span>
				)}
			</div>
			<div className="grid gap-3 @md:grid-cols-2">
				{[
					[
						"Go to",
						["g d", "Dashboard"],
						["g i", "Invoices"],
						["g q", "Quotations"],
						["g c", "Customers"],
						["g b", "Banking"],
					],
					[
						"Create",
						["c i", "New invoice"],
						["c q", "New quotation"],
						["c j", "New journal entry"],
						["c c", "New customer"],
					],
				].map((sec) => (
					<div key={sec[0]} className="rounded-xl border border-border bg-card px-3 py-2">
						<div className="mb-1 text-xs font-medium text-tertiary-foreground">{sec[0]}</div>
						{sec.slice(1).map((it) => (
							<div
								key={it[0]}
								className="flex items-center justify-between gap-3 border-b border-table-row-divider py-1.5 text-sm text-foreground last:border-0"
							>
								<span>{it[1]}</span>
								<span className="flex gap-1">
									{it[0].split(" ").map((k, i) => (
										<Kbd key={i} keys={k} />
									))}
								</span>
							</div>
						))}
					</div>
				))}
			</div>
			<ShortcutsDialog open={open} onOpenChange={setOpen} />
		</div>
	);
}
```

## Use

Mount once in the app shell. Pass your own sections or use CYNCO_SHORTCUT_SECTIONS (Global, Go to, Create, Lists, Journal entry). Call useGoToShortcuts(CYNCO_GOTO_ROUTES, navigate) in the shell so G then I opens Invoices and C then J starts a journal entry.

## Props

ShortcutsDialog: open / defaultOpen / onOpenChange; sections ([{title, items: [{keys, label}]}], keys like "mod+enter", "g i" for a sequence, or an array of alternatives); hotkey (default "?", false to bind your own); title; className. useGoToShortcuts(map, navigate, {enabled, timeout = 1200 ms, leader = "g"}): map keys are a letter after the leader or a full sequence ("c i"); returns {pending} so you can show “G…” while it waits.

## Notes

Keys: “?” opens (never while typing), type to filter by label, key or section, Esc closes and returns focus. Sequences are ignored while typing, inside dialogs and menus, and with ⌘/Ctrl/Alt held; any other key or the timeout cancels. Sections flow into two columns once the dialog is 36rem wide.

Category: Productivity. Source: `packages/ui/src/productivity/navigation.tsx`.
