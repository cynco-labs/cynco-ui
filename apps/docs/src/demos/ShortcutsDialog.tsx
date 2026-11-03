import { Fragment, useState } from "react";
import { Button, Kbd, ShortcutsDialog, useCharacterKeyShortcuts, useGoToShortcuts } from "@cynco-labs/ui";

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

const LABELS = {
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
	const [went, setWent] = useState(null);
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
			<ShortcutsDialog open={open} onOpenChange={setOpen} sections={SECTIONS} />
		</div>
	);
}
