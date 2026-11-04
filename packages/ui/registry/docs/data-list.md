# DataList

The one way to show rows of records: Cynco UI's tray table on wide containers, one stacked card per row on narrow ones.

```tsx
import { DataList } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Checkbox, type DataColumn, DataList, DocStatus, formatDate, INVOICE_STATUS, Money } from "@cynco-labs/ui";
import { useState } from "react";

type Row = {
	id: string;
	no: string;
	customer: string;
	date: string;
	amount: number;
	status: string;
};

const rows: Row[] = [
	{
		id: "1",
		no: "INV-2026-0142",
		customer: "Syarikat Maju Jaya Sdn Bhd",
		date: "2026-10-28",
		amount: 12850,
		status: "finalized",
	},
	{
		id: "2",
		no: "INV-2026-0140",
		customer: "Tropika Kopi Enterprise",
		date: "2026-10-02",
		amount: 3240,
		status: "overdue",
	},
	{
		id: "3",
		no: "INV-2026-0139",
		customer: "Nusantara Logistik Bhd",
		date: "2026-09-30",
		amount: 28400,
		status: "paid",
	},
];

const cols: DataColumn<Row>[] = [
	{
		key: "no",
		header: "Invoice #",
		mobile: "title",
		nowrap: true,
		cell: (r) => <span className="font-mono text-xs text-primary">{r.no}</span>,
	},
	{ key: "customer", header: "Customer", cell: (r) => r.customer },
	{
		key: "date",
		header: (
			<>
				Date <span aria-hidden="true">↓</span>
			</>
		),
		stackedLabel: "Date",
		nowrap: true,
		sortDirection: "descending",
		cell: (r) => formatDate(r.date),
	},
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

function List() {
	const [sel, set] = useState(["2"]);
	return (
		<DataList
			columns={cols}
			rows={rows}
			getKey={(r) => r.id}
			caption="Invoices"
			leading={(r) => (
				<Checkbox
					checked={sel.indexOf(r.id) >= 0}
					onCheckedChange={(v) => {
						set(v ? sel.concat(r.id) : sel.filter((x) => x !== r.id));
					}}
					aria-label={`Select ${r.no}`}
				/>
			)}
			isRowSelected={(r) => sel.indexOf(r.id) >= 0}
			onRowClick={() => {}}
			totals={{ label: "Total", amount: <Money amount="44490.00" /> }}
		/>
	);
}

export default function DataListDemo() {
	return (
		<div className="flex flex-col gap-3">
			<List />
			<div className="w-full max-w-[340px] rounded-xl border border-dashed border-border p-2">
				<List />
			</div>
		</div>
	);
}
```

## Use

Any list of documents, accounts, transactions or lines you can describe as columns and rows. Don't hand-build <table> markup in a screen; declare columns and let DataList handle layout, selection, totals and the narrow-width card view. When the rows come from a TanStack table instance, use `DataTable`; for a handful of static rows, use the `Table` primitives.

## Props

columns (key, header, cell, align, className, mobile: title | value | badge | meta | hidden | table | stacked, stackedAs, stackedCell, stackedLabel), rows, getKey; optional stackBelow (sm…3xl or never, default xl = 36rem of container width), column nowrap (keep IDs and dates on one line in the table), onRowClick (the primary cell, or the title when stacked, becomes the row's button; a click anywhere else on the row opens it too), column primary (the row header and button cell; default the first table column), column sortDirection (ascending | descending | none, announced as aria-sort on the header; DataList doesn't sort), isRowSelected, rowClassName, leading / leadingHeader (checkbox), trailing (row menu), totals ({label, [columnKey]: node} — a column-aligned tfoot in the table, a bold summary card when stacked), footer, empty, caption, dense / density (compact | default | comfortable; defaults from DensityProvider), stickyHeader + maxHeight (rows scroll, headers and totals stay put), className and any div props.

- `columns`: `DataColumn<T>[]`
- `rows`: `T[]`
- `getKey`: `(row: T, index: number) => string`
- `stackBelow?`: `"sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "never"`. Container width below which rows stack. Default `xl` (36rem). `never` keeps the table (it scrolls sideways). Default `"xl"`.
- `onRowClick?`: `(row: T) => void`. Opens a row. The primary cell (table) or title (stacked) becomes a real button, so the row is reachable with Tab and announced as actionable; a click anywhere else on the row does the same.
- `isRowSelected?`: `(row: T) => boolean`
- `rowClassName?`: `(row: T) => string`. Extra classes per row, in both layouts (e.g. dim inactive rows).
- `leading?`: `(row: T) => ReactNode`. Leading cell per row (e.g. a checkbox) — shown in both layouts.
- `leadingHeader?`: `ReactNode`
- `trailing?`: `(row: T) => ReactNode`. Trailing cell per row (e.g. a row menu) — shown in both layouts.
- `totals?`: `({ label?: ReactNode } & Record<string, ReactNode>)`. A totals row, keyed by column key. Renders column-aligned in the table (`tfoot`) and as a bold summary card in the stacked layout. Use `label` for the first cell's text.
- `footer?`: `ReactNode`. Free footer under the table / list, inside the tray.
- `empty?`: `ReactNode`
- `caption?`: `string`
- `dense?`: `boolean`. Compact rows. Defaults from the nearest DensityProvider.
- `density?`: `"compact" | "default" | "comfortable"`. Row density (overrides `dense` and DensityProvider).
- `stickyHeader?`: `boolean`. Keep the column headers (and totals) in view while the rows scroll. Needs `maxHeight`.
- `maxHeight?`: `string`. Scroll the rows inside this height (any CSS length, e.g. "24rem"); headers and totals stay put when `stickyHeader`.
- Also accepts `ComponentProps<"div">`.

## Accessibility

| Key | Does |
| --- | --- |
| Tab | Reaches the row's primary cell, which becomes a real button when onRowClick is set, and the scrolling region itself when the rows overflow it. |

The primary column renders as the row header (th scope="row"), column headers are th scope="col" and carry aria-sort from each column's sortDirection, and a trailing actions column gets an sr-only "Actions" header. A clickable row is never itself the focus stop, so its primary cell holds the button and the row's checkbox and menu are not nested inside a focusable row. Selection without a leading checkbox is reported as aria-current, and caption becomes an sr-only table caption and the label for the stacked list and for the scrollable region.

## Notes

Responds to its own container (CSS container queries), so the same list works in a page, a side sheet and on a phone. The primary column renders as the row header (th scope=row). Rows are never focus stops themselves: with onRowClick the primary cell holds a real button (focus-ring-inset), so screen readers announce it and the row's checkbox and menu aren't nested inside a focusable row. Selection without a leading checkbox is aria-current on that button. Leading/trailing cells and any control inside a row keep their clicks; keep a clickable row's primary cell free of links and buttons.

Category: Layout · Primitives. Source: `packages/ui/src/layout/data-list.tsx:119-452`.
