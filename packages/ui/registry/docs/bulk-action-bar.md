# BulkActionBar

Floating toolbar for ticked rows: "3 selected · RM 34,890.00", Select all N / Clear, the main actions as buttons and the rest in a ⋯ menu.

```tsx
import { BulkActionBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { ArrowSquareOutIcon, CopyIcon, CreditCardIcon, TrashIcon } from "@phosphor-icons/react";
import {
	BulkActionBar,
	Checkbox,
	DataList,
	type DataColumn,
	DocStatus,
	INVOICE_STATUS,
	Money,
	formatCurrency,
	formatDate,
	sumAmounts,
} from "@cynco-labs/ui";

const INV = [
	{
		id: "1",
		no: "INV-2026-0142",
		customer: "Syarikat Maju Jaya Sdn Bhd",
		due: "2026-11-12",
		amount: "12850.00",
		status: "finalized",
	},
	{
		id: "2",
		no: "INV-2026-0141",
		customer: "Tropika Kopi Enterprise",
		due: "2026-10-30",
		amount: "3240.00",
		status: "overdue",
	},
	{
		id: "3",
		no: "INV-2026-0140",
		customer: "Nusantara Logistik Bhd",
		due: "2026-11-05",
		amount: "18800.00",
		status: "finalized",
	},
	{
		id: "4",
		no: "INV-2026-0139",
		customer: "Pelita Hartanah Sdn Bhd",
		due: "2026-10-21",
		amount: "7450.50",
		status: "overdue",
	},
	{
		id: "5",
		no: "INV-2026-0138",
		customer: "Batik Warisan Trading",
		due: "2026-11-18",
		amount: "2190.00",
		status: "finalized",
	},
	{
		id: "6",
		no: "INV-2026-0137",
		customer: "Klinik Sentosa Sdn Bhd",
		due: "2026-11-20",
		amount: "5600.00",
		status: "draft",
	},
	{
		id: "7",
		no: "INV-2026-0136",
		customer: "Cahaya Solar Teknik",
		due: "2026-10-15",
		amount: "21375.25",
		status: "overdue",
	},
	{
		id: "8",
		no: "INV-2026-0135",
		customer: "Restoran Selera Kampung",
		due: "2026-11-25",
		amount: "980.00",
		status: "finalized",
	},
];

type Invoice = (typeof INV)[0];
const cols: DataColumn<Invoice>[] = [
	{
		key: "no",
		header: "Invoice #",
		mobile: "title",
		nowrap: true,
		cell: (r) => <span className="font-mono text-xs text-primary">{r.no}</span>,
	},
	{ key: "customer", header: "Customer", cell: (r) => r.customer },
	{ key: "due", header: "Due", nowrap: true, cell: (r) => formatDate(r.due) },
	{
		key: "status",
		header: "Status",
		mobile: "badge",
		cell: (r) => <DocStatus status={r.status} config={INVOICE_STATUS} />,
	},
	{
		key: "amount",
		header: "Amount",
		align: "right",
		mobile: "value",
		cell: (r) => <Money amount={r.amount} />,
	},
];

export default function BulkActionBarDemo() {
	const [sel, setSel] = useState(["1", "3", "5"]);
	const [log, setLog] = useState(
		"Try: tick rows · Esc clears · P / R / D run actions · ← → move along the bar · ⋯ for more",
	);
	const picked = INV.filter((r) => sel.indexOf(r.id) >= 0);
	const total = sumAmounts(picked.map((r) => r.amount));
	function run(verb: string) {
		return () => {
			setLog(
				verb +
					" " +
					picked.length +
					" invoice" +
					(picked.length === 1 ? "" : "s") +
					" (" +
					formatCurrency(total) +
					")",
			);
		};
	}
	const actions = [
		{
			id: "pay",
			label: "Record payment",
			icon: <CreditCardIcon size={14} />,
			shortcut: "p",
			onSelect: run("Recorded payment for"),
		},
		{
			id: "remind",
			label: "Send reminder",
			icon: <ArrowSquareOutIcon size={14} />,
			shortcut: "r",
			onSelect: run("Sent reminders for"),
		},
		{
			id: "pdf",
			label: "Download PDFs",
			icon: <CopyIcon size={14} />,
			shortcut: "d",
			onSelect: run("Downloading PDFs for"),
		},
		{ id: "dup", label: "Duplicate", icon: <CopyIcon size={14} />, onSelect: run("Duplicated") },
		{
			id: "csv",
			label: "Export to CSV",
			icon: <ArrowSquareOutIcon size={14} />,
			shortcut: "mod+e",
			onSelect: run("Exported"),
		},
		{
			id: "void",
			label: "Void",
			icon: <TrashIcon size={14} />,
			destructive: true,
			shortcut: "shift+v",
			onSelect: () => {
				run("Voided")();
				setSel([]);
			},
		},
	];
	const all = sel.length === INV.length;
	return (
		<div className="flex flex-col gap-3">
			<p className="text-xs text-tertiary-foreground" role="status">
				{log}
			</p>
			<div className="max-h-[330px] overflow-y-auto rounded-xl">
				<DataList
					columns={cols}
					rows={INV}
					getKey={(r) => r.id}
					caption="Invoices"
					leadingHeader={
						<Checkbox
							checked={all}
							indeterminate={sel.length > 0 && !all}
							onCheckedChange={(v) => {
								setSel(v ? INV.map((r) => r.id) : []);
							}}
							aria-label="Select all invoices"
						/>
					}
					leading={(r) => (
						<Checkbox
							checked={sel.indexOf(r.id) >= 0}
							onCheckedChange={(v) => {
								setSel(v ? sel.concat(r.id) : sel.filter((x) => x !== r.id));
							}}
							aria-label={"Select " + r.no}
						/>
					)}
					isRowSelected={(r) => sel.indexOf(r.id) >= 0}
				/>
				<BulkActionBar
					className="mt-2"
					count={sel.length}
					total={total}
					totalCount={INV.length}
					onSelectAll={() => {
						setSel(INV.map((r) => r.id));
					}}
					onClear={() => {
						setSel([]);
					}}
					actions={actions}
				/>
			</div>
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<BulkActionBar
					sticky={false}
					count={sel.length || 2}
					total={sel.length ? total : "16090.00"}
					totalCount={INV.length}
					onSelectAll={() => {
						setSel(INV.map((r) => r.id));
					}}
					onClear={() => {
						setSel([]);
					}}
					actions={actions.slice(0, 2).concat(actions.slice(4))}
				/>
			</div>
		</div>
	);
}
```

## Use

Under any DataList with checkboxes. Render it after the list inside the scrolling container; it sticks to the bottom while rows scroll and disappears at 0 selected. Compute `total` with sumAmounts over the selected rows' money field.

## Props

count, onClear, actions ([{id, label, icon?, onSelect, destructive?, shortcut? ("p", "shift+v", "mod+e"), disabled?, overflow? (always in the ⋯ menu)}]); optional total (decimal string), currency (default MYR), totalCount + onSelectAll (shows "Select all N"), maxVisible (buttons before the ⋯ menu, default 3), sticky (default true), label (toolbar name), className and any div props.

- `count`: `number`. Selected rows. The bar renders nothing at 0.
- `onClear`: `() => void`. Clear the selection (also Esc).
- `actions`: `BulkAction[]`
- `total?`: `string`. Sum of the selected rows' money field, as a decimal string (use `sumAmounts`).
- `currency?`: `string`. Default `"MYR"`.
- `totalCount?`: `number`. Rows in the whole list — shows "Select all N" while only some are selected.
- `onSelectAll?`: `() => void`
- `maxVisible?`: `number`. Buttons shown before the rest go into the ⋯ menu. Default 3.
- `sticky?`: `boolean`. Stick to the bottom of the scrolling container. Default true.
- `label?`: `string`. Accessible name of the toolbar.
- Also accepts `ComponentProps<"div">`.

## Notes

The count/total is aria-live. Responsive: one row from 48rem of container width (keycaps shown), below that the summary + Select all/Clear sit above the actions, and under 24rem the summary takes its own line; hidden in print.

Category: Productivity. Source: `packages/ui/src/productivity/workflow.tsx`.
