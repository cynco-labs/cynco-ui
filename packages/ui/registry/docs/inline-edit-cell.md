# InlineEditCell

A table cell that edits in place: click, Enter or F2 to edit text or an amount, Enter or Tab to save, Esc to cancel, with a spinner while an async save is pending and a revert plus message when it fails.

```tsx
import { InlineEditCell } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import type React from "react";
import {
	type DataColumn,
	DataList,
	InlineEditCell,
	Kbd,
	Money,
	formatDate,
	sumAmounts,
	toSen,
} from "@cynco-labs/ui";

function Hint({ children }: { children: React.ReactNode }) {
	return <p className="text-xs text-tertiary-foreground">{children}</p>;
}

function K(k: Parameters<typeof Kbd>[0]["keys"]) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
}

type ClaimRow = { id: string; date: string; ref: string; desc: string; amount: string };

const START: ClaimRow[] = [
	{
		id: "c1",
		date: "2026-10-03",
		ref: "EXP-2026-0311",
		desc: "Grab rides – client visit, Cyberjaya",
		amount: "86.40",
	},
	{
		id: "c2",
		date: "2026-10-09",
		ref: "EXP-2026-0318",
		desc: "Petronas fuel – site survey Klang",
		amount: "150.00",
	},
	{
		id: "c3",
		date: "2026-10-21",
		ref: "EXP-2026-0326",
		desc: "Team lunch, Nasi Kandar Pelita",
		amount: "212.75",
	},
];

function wait(ms: number) {
	return new Promise<void>((r) => {
		setTimeout(r, ms);
	});
}

export default function InlineEditCellDemo() {
	const [rows, setRows] = useState<ClaimRow[]>(START);
	function save(id: string, field: keyof ClaimRow) {
		return (v: string) =>
			wait(700).then(() => {
				if (field === "desc" && !v) throw new Error("Description can’t be empty");
				if (field === "amount" && toSen(v) > toSen("5000"))
					throw new Error("Over your claim limit of RM 5,000.00");
				setRows((prev) =>
					prev.map((r) => {
						if (r.id !== id) return r;
						return { ...r, [field]: v };
					}),
				);
			});
	}
	const cols: DataColumn<ClaimRow>[] = [
		{
			key: "ref",
			header: "Claim",
			mobile: "meta",
			nowrap: true,
			cell: (r) => <span className="text-tiny-id text-muted-foreground">{r.ref}</span>,
		},
		{ key: "date", header: "Date", mobile: "meta", nowrap: true, cell: (r) => formatDate(r.date) },
		{
			key: "desc",
			header: "Description",
			mobile: "title",
			className: "w-full",
			cell: (r) => (
				<InlineEditCell
					value={r.desc}
					onSave={save(r.id, "desc")}
					aria-label={"Description for " + r.ref}
					placeholder="Add a description"
				/>
			),
		},
		{
			key: "amount",
			header: "Amount",
			align: "right",
			mobile: "value",
			className: "min-w-[9rem]",
			cell: (r) => (
				<InlineEditCell
					kind="amount"
					currency="MYR"
					value={r.amount}
					onSave={save(r.id, "amount")}
					aria-label={"Amount for " + r.ref}
				/>
			),
		},
	];
	const total = sumAmounts(rows.map((r) => r.amount));
	function list() {
		return (
			<DataList
				columns={cols}
				rows={rows}
				getKey={(r) => r.id}
				caption="Expense claims"
				totals={{ label: "Total claimed", amount: <Money amount={total} /> }}
			/>
		);
	}
	return (
		<div className="flex flex-col gap-3">
			<Hint>
				{"Click a description or amount, or Tab to it and press "}
				{K("enter")}
				{" / "}
				{K("F2")}
				{". "}
				{K("enter")}
				{" or Tab saves, "}
				{K("esc")}
				{" cancels. Try an amount over 5,000 or an empty description to see a rejected save."}
			</Hint>
			{list()}
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				{list()}
			</div>
		</div>
	);
}
```

## Use

Inside DataList / table cells for quick single-field corrections where opening a form would be slower: descriptions, references, amounts on draft documents.

## Props

value, onSave(value) => void | Promise<void> (reject with an Error to revert and show its message), kind? ("text" | "amount"), currency? (amount read-out), placeholder?, allowNegative?, disabled?, aria-label (field name, e.g. "Description for EXP-2026-0311"), className and native div props.

- `value`: `string`. The saved value (text, or a decimal string for `kind="amount"`).
- `onSave`: `(value: string) => void | Promise<void>`. Persist the new value. Return a promise to show a spinner; reject to revert and show its message.
- `kind?`: `"text" | "amount"`. Default `"text"`.
- `currency?`: `string`. For amounts: formats the read-out ("RM 1,296.00").
- `placeholder?`: `string`
- `allowNegative?`: `boolean`. For amounts: accept negatives. Default true. Default `true`.
- `disabled?`: `boolean`
- Also accepts `ComponentProps<"div">`.

## Notes

Keyboard: the cell is a button (visible focus ring, pencil on hover/focus); Enter, Space, F2 or click starts editing; Enter saves and returns focus to the cell; Tab or blur saves and moves on; Esc cancels. Amount mode uses AmountInput, so formulas work and an invalid figure stays in edit mode. Status (Saving… / Saved / error) is announced through aria-live; the saved tick fades after 1.6s. Fills its cell, so it follows DataList's table / stacked layouts.

Category: Productivity. Source: `packages/ui/src/productivity/entry.tsx`.
