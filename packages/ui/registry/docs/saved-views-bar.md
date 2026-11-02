# SavedViewsBar

Saved views for any list: a scrolling row of view tabs with counts, the active filters as removable FilterChips, and Save / Save as new / Reset once the filters drift from the view; rename, duplicate, share and delete from the active view's menu.

```tsx
import { SavedViewsBar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Fragment, useState } from "react";
import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import {
	Button,
	DataList,
	DocStatus,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	INVOICE_STATUS,
	Kbd,
	Money,
	SavedViewsBar,
	formatDate,
	sumAmounts,
} from "@cynco-labs/ui";

const TODAY = "2026-11-01";

const rows = [
	{
		id: "1",
		no: "INV-2026-0142",
		customer: "Syarikat Maju Jaya Sdn Bhd",
		due: "2026-11-04",
		amount: "12850.00",
		status: "finalized",
		owner: "me",
	},
	{
		id: "2",
		no: "INV-2026-0140",
		customer: "Tropika Kopi Enterprise",
		due: "2026-10-17",
		amount: "3240.00",
		status: "overdue",
		owner: "aisyah",
	},
	{
		id: "3",
		no: "INV-2026-0139",
		customer: "Nusantara Logistik Bhd",
		due: "2026-10-30",
		amount: "28400.00",
		status: "paid",
		owner: "me",
	},
	{
		id: "4",
		no: "INV-2026-0143",
		customer: "Kedai Runcit Ah Seng",
		due: "2026-11-15",
		amount: "860.00",
		status: "draft",
		owner: "me",
	},
	{
		id: "5",
		no: "INV-2026-0137",
		customer: "Syarikat Maju Jaya Sdn Bhd",
		due: "2026-10-09",
		amount: "15600.00",
		status: "overdue",
		owner: "me",
	},
	{
		id: "6",
		no: "INV-2026-0144",
		customer: "Borneo Timber Works Sdn Bhd",
		due: "2026-11-06",
		amount: "7420.50",
		status: "finalized",
		owner: "aisyah",
	},
	{
		id: "7",
		no: "INV-2026-0145",
		customer: "Tropika Kopi Enterprise",
		due: "2026-11-30",
		amount: "1980.00",
		status: "draft",
		owner: "aisyah",
	},
	{
		id: "8",
		no: "INV-2026-0141",
		customer: "Nusantara Logistik Bhd",
		due: "2026-11-03",
		amount: "22150.00",
		status: "partially_paid",
		owner: "me",
	},
];

const STATUS_LABEL = {
	draft: "Draft",
	finalized: "Pending",
	overdue: "Overdue",
	paid: "Paid",
	partially_paid: "Partially Paid",
};

function match(r, f) {
	if (f.field === "status") return STATUS_LABEL[r.status] === f.value;
	if (f.field === "customer") return r.customer === f.value;
	if (f.field === "owner") return f.value === "Me" ? r.owner === "me" : true;
	if (f.field === "due")
		return f.value === "This week"
			? r.due >= TODAY && r.due <= "2026-11-07" && r.status !== "paid"
			: true;
	if (f.field === "amount") return Number(r.amount) >= 10000;
	return true;
}

function apply(fs) {
	const byField = {};
	fs.forEach((f) => {
		(byField[f.field] = byField[f.field] || []).push(f);
	});
	return rows.filter((r) => Object.keys(byField).every((k) => byField[k].some((f) => match(r, f))));
}

const VIEWS = [
	{ id: "all", name: "All", filters: [], locked: true },
	{
		id: "overdue",
		name: "Overdue",
		filters: [{ id: "f1", field: "status", label: "Status", value: "Overdue" }],
		shared: true,
	},
	{
		id: "week",
		name: "Due this week",
		filters: [{ id: "f2", field: "due", label: "Due", value: "This week" }],
		shared: true,
	},
	{
		id: "drafts",
		name: "My drafts",
		filters: [
			{ id: "f3", field: "status", label: "Status", value: "Draft" },
			{ id: "f4", field: "owner", label: "Owner", value: "Me" },
		],
	},
	{
		id: "big",
		name: "Maju Jaya ≥ RM 10k",
		filters: [
			{ id: "f5", field: "customer", label: "Customer", value: "Syarikat Maju Jaya Sdn Bhd" },
			{ id: "f6", field: "amount", label: "Amount", value: "≥ RM 10,000" },
		],
	},
];

const ADD = [
	{
		field: "status",
		label: "Status",
		values: ["Draft", "Pending", "Overdue", "Paid", "Partially Paid"],
	},
	{
		field: "customer",
		label: "Customer",
		values: ["Syarikat Maju Jaya Sdn Bhd", "Tropika Kopi Enterprise", "Nusantara Logistik Bhd"],
	},
	{ field: "due", label: "Due", values: ["This week"] },
	{ field: "amount", label: "Amount", values: ["≥ RM 10,000"] },
];

const cols = [
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

let seq = 10;

export default function SavedViewsBarDemo() {
	const [views, setViews] = useState(VIEWS);
	const [active, setActive] = useState("overdue");
	const [filters, setFilters] = useState(VIEWS[1].filters);
	const counts = {};
	views.forEach((x) => {
		counts[x.id] = apply(x.filters).length;
	});
	const shown = apply(filters);
	function add(field, label, value) {
		if (filters.some((x) => x.field === field && x.value === value)) return;
		setFilters(filters.concat({ id: "f" + seq++, field, label, value }));
	}
	const addFilter = (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="dotted" size="sm" />}>
				<PlusIcon className="size-3" />
				Add filter
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-56">
				{ADD.map((g, gi) => (
					<Fragment key={g.field}>
						{gi > 0 && <DropdownMenuSeparator />}
						<DropdownMenuGroup>
							<DropdownMenuLabel>{g.label}</DropdownMenuLabel>
							{g.values.map((val) => (
								<DropdownMenuItem
									key={val}
									onClick={() => {
										add(g.field, g.label, val);
									}}
								>
									{val}
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
					</Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
	return (
		<div className="flex flex-col gap-3">
			<p className="text-xs text-tertiary-foreground">
				{"Try: Tab to the views, "}
				<Kbd keys={["left"]} /> <Kbd keys={["right"]} />
				{" then "}
				<Kbd keys="enter" />
				{"; remove a chip or add a filter, then Save view / Save as new / Reset. The "}
				<DotsThreeIcon className="inline size-3" />
				{" menu renames, shares or deletes."}
			</p>
			<SavedViewsBar
				views={views}
				onViewsChange={setViews}
				activeViewId={active}
				onActiveViewChange={setActive}
				filters={filters}
				onFiltersChange={setFilters}
				counts={counts}
				addFilter={addFilter}
			/>
			<DataList
				columns={cols}
				rows={shown}
				getKey={(r) => r.id}
				caption="Invoices"
				onRowClick={() => {}}
				empty="No invoices match these filters."
				totals={
					shown.length
						? {
								label: shown.length + " invoice" + (shown.length === 1 ? "" : "s"),
								amount: <Money amount={sumAmounts(shown.map((r) => r.amount))} />,
							}
						: undefined
				}
			/>
		</div>
	);
}
```

## Use

Above a DataList whose rows you filter from `filters`. Ship built-in views (All, Overdue, Due this week) as `locked`, let people save their own as personal or shared with the team, and persist `views` through onViewsChange.

## Props

views / defaultViews / onViewsChange (SavedView: id, name, filters, count, shared, locked); activeViewId / defaultActiveViewId / onActiveViewChange; filters / defaultFilters / onFiltersChange (SavedViewFilter: id, field, label, value — the list applies field+value, chips show label and value); counts (rows per view id); addFilter (your Add-filter control, rendered after the chips); label (accessible name, default “Saved views”); className and any div props.

- `views?`: `SavedView[]`
- `defaultViews?`: `SavedView[]`. Default `[]`.
- `onViewsChange?`: `(views: SavedView[]) => void`
- `activeViewId?`: `string`
- `defaultActiveViewId?`: `string`
- `onActiveViewChange?`: `(id: string) => void`
- `filters?`: `SavedViewFilter[]`. Filters applied to the list right now. Uncontrolled default: the active view's filters.
- `defaultFilters?`: `SavedViewFilter[]`
- `onFiltersChange?`: `(filters: SavedViewFilter[]) => void`
- `counts?`: `Record<string, number>`. Row counts per view id (overrides `view.count`).
- `addFilter?`: `ReactNode`. Your "Add filter" control, shown after the chips.
- `label?`: `string`. Accessible name of the view switcher. Default "Saved views". Default `"Saved views"`.
- Also accepts `ComponentProps<"div">`.

## Notes

A blue dot marks a modified view; locked views offer Save as new only. The tab row scrolls sideways on narrow containers and the save actions wrap under the chips.

Category: Productivity. Source: `packages/ui/src/productivity/navigation.tsx`.
