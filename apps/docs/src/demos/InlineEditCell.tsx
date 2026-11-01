import { useState } from "react";
import {
	DataList,
	InlineEditCell,
	Kbd,
	Money,
	formatDate,
	sumAmounts,
	toSen,
} from "@cynco-labs/ui";

function Hint(p) {
	return <p className="text-xs text-tertiary-foreground">{p.children}</p>;
}

function K(k) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
}

const START = [
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

function wait(ms) {
	return new Promise((r) => {
		setTimeout(r, ms);
	});
}

export default function InlineEditCellDemo() {
	const [rows, setRows] = useState(START);
	function save(id, field) {
		return (v) =>
			wait(700).then(() => {
				if (field === "desc" && !v) throw new Error("Description can’t be empty");
				if (field === "amount" && toSen(v) > toSen("5000"))
					throw new Error("Over your claim limit of RM 5,000.00");
				setRows((prev) =>
					prev.map((r) => {
						if (r.id !== id) return r;
						const o = Object.assign({}, r);
						o[field] = v;
						return o;
					}),
				);
			});
	}
	const cols = [
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
