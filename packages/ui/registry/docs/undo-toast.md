# UndoToast

"Do it, then offer Undo": a toast with the message, an Undo button (⌘/Ctrl+Z), an optional countdown and late commit — the real write runs in onCommit only if nobody undoes.

```tsx
import { UndoToast } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useEffect, useState } from "react";
import {
	ActionBar,
	Button,
	DataList,
	DocStatus,
	INVOICE_STATUS,
	Money,
	UndoToastProvider,
	useUndoToast,
} from "@cynco-labs/ui";

const START = [
	{
		id: "1",
		no: "INV-2026-0141",
		customer: "Tropika Kopi Enterprise",
		amount: "3240.00",
		status: "overdue",
	},
	{
		id: "2",
		no: "INV-2026-0139",
		customer: "Pelita Hartanah Sdn Bhd",
		amount: "7450.50",
		status: "overdue",
	},
	{
		id: "3",
		no: "INV-2026-0137",
		customer: "Klinik Sentosa Sdn Bhd",
		amount: "5600.00",
		status: "draft",
	},
	{
		id: "4",
		no: "INV-2026-0136",
		customer: "Cahaya Solar Teknik",
		amount: "21375.25",
		status: "overdue",
	},
];

function Demo() {
	const toast = useUndoToast();
	const [rows, setRows] = useState(START);
	const [pending, setPending] = useState([]);
	const [log, setLog] = useState([
		"Try: Void → Undo (or Ctrl/⌘+Z) · hover pauses the countdown · F8 focuses the toast, Esc dismisses",
	]);
	function voidIds(ids) {
		if (!ids.length) return;
		const nos = rows.filter((x) => ids.indexOf(x.id) >= 0).map((x) => x.no);
		setPending((ps) => ps.concat(ids));
		toast.show({
			message:
				ids.length === 1 ? (
					<span>
						<span className="font-mono text-xs">{nos[0]}</span>
						{" voided"}
					</span>
				) : (
					ids.length + " invoices voided"
				),
			onUndo: () => {
				setPending((ps) => ps.filter((x) => ids.indexOf(x) < 0));
				setLog((L) => ["Undone: " + nos.join(", ") + " restored"].concat(L).slice(0, 3));
			},
			onCommit: () => {
				setPending((ps) => ps.filter((x) => ids.indexOf(x) < 0));
				setRows((rs) =>
					rs.map((x) => (ids.indexOf(x.id) >= 0 ? Object.assign({}, x, { status: "voided" }) : x)),
				);
				setLog((L) =>
					["Committed: " + nos.join(", ") + " voided on the server"].concat(L).slice(0, 3),
				);
			},
		});
	}
	useEffect(() => {
		voidIds(["3"]);
	}, []);
	const open = rows.filter((x) => x.status !== "voided" && pending.indexOf(x.id) < 0);
	const overdue = open
		.filter((x) => x.status === "overdue")
		.slice(0, 2)
		.map((x) => x.id);
	const cols = [
		{
			key: "no",
			header: "Invoice #",
			mobile: "title",
			nowrap: true,
			cell: (x) => <span className="font-mono text-xs text-primary">{x.no}</span>,
		},
		{ key: "customer", header: "Customer", cell: (x) => x.customer },
		{
			key: "status",
			header: "Status",
			mobile: "badge",
			cell: (x) =>
				pending.indexOf(x.id) >= 0 ? (
					<span className="text-xs text-tertiary-foreground">Voiding…</span>
				) : (
					<DocStatus status={x.status} config={INVOICE_STATUS} />
				),
		},
		{
			key: "amount",
			header: "Amount",
			align: "right",
			mobile: "value",
			cell: (x) => <Money amount={x.amount} />,
		},
	];
	return (
		<div className="flex flex-col gap-3">
			<ActionBar>
				<Button
					variant="secondary"
					disabled={!overdue.length}
					onClick={() => {
						voidIds(overdue);
					}}
				>
					{"Void " + overdue.length + " overdue"}
				</Button>
				<Button
					variant="skeleton"
					onClick={() => {
						setRows(START);
						setPending([]);
					}}
				>
					Reset
				</Button>
			</ActionBar>
			<DataList
				columns={cols}
				rows={rows}
				getKey={(x) => x.id}
				caption="Invoices"
				dense
				rowClassName={(x) => (pending.indexOf(x.id) >= 0 ? "line-through decoration-tertiary-foreground" : undefined)}
				trailing={(x) =>
					x.status === "voided" || pending.indexOf(x.id) >= 0 ? null : (
						<Button
							variant="skeleton"
							size="sm"
							aria-label={"Void " + x.no}
							onClick={() => {
								voidIds([x.id]);
							}}
						>
							Void
						</Button>
					)
				}
			/>
			<ul className="flex flex-col gap-0.5 text-xs text-tertiary-foreground">
				{log.map((t, i) => (
					<li key={i + t}>{t}</li>
				))}
			</ul>
		</div>
	);
}

export default function UndoToastDemo() {
	return (
		<UndoToastProvider position="bottom-right">
			<Demo />
		</UndoToastProvider>
	);
}
```

## Use

Mount UndoToastProvider once near the app root. On a destructive action, update the UI optimistically and call useUndoToast().show({message, onUndo, onCommit}); do the server call in onCommit. Keep real confirm dialogs only for actions that can't be held back (e.g. submitting to LHDN).

## Props

UndoToastProvider: children, max (default 3; a 4th toast commits the oldest), duration (ms, default Infinity: stays until dismissed, undone or pushed out, per WCAG 2.2.1), viewport (default true; false to place <UndoToastViewport/> yourself), position (bottom-center | bottom-right | bottom-left). useUndoToast() → {show({message, onUndo, onCommit?, duration?, undoLabel?, id?}) → id, undo(id?), dismiss(id), count}. UndoToastViewport: position, className, section props. UndoToast (the presentational item): message, onUndo, onDismiss, onExpire, duration, undoLabel, showShortcut, paused, className, li props.

- `message`: `ReactNode`
- `onUndo`: `() => void`
- `onDismiss?`: `() => void`. Close button / Esc.
- `onExpire?`: `() => void`. The countdown ran out.
- `duration?`: `number`. ms; 0 or Infinity = no countdown. Default Infinity (stays until dismissed). Default `Number.POSITIVE_INFINITY`.
- `undoLabel?`: `string`. Default `"Undo"`.
- `showShortcut?`: `boolean`. Show the ⌘/Ctrl+Z keycap on the Undo button (the newest toast). Default true. Default `true`.
- `paused?`: `boolean`. Hold the countdown (it also pauses on hover, on focus and while the tab is hidden).
- `returnFocusTo?`: `MutableRefObject<HTMLElement | null>`. Focus target when this toast closes while focused.
- Also accepts `ComponentProps<"li">`.

## Notes

Keyboard: ⌘/Ctrl+Z undoes the newest toast (left alone while typing in a field, where it is the field's own undo); F8 jumps to the newest Undo button; Esc on a focused toast dismisses (commits) it; focus returns to where it was. The countdown pauses on hover, on focus and while the tab is hidden; the stack is an aria-live="polite" list. Each toast settles exactly once; anything pending commits when the provider unmounts or on pagehide. No toast library — the countdown is a CSS animation whose end commits. Width is min(24rem, viewport − 2rem); hidden in print.

Category: Productivity. Source: `packages/ui/src/productivity/workflow.tsx`.
