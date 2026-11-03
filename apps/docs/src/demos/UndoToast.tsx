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
	type DataColumn,
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
	const [pending, setPending] = useState<string[]>([]);
	const [log, setLog] = useState([
		"Try: Void → Undo (or Ctrl/⌘+Z) · hover pauses the countdown · F8 focuses the toast, Esc dismisses",
	]);
	function voidIds(ids: string[]) {
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
	type InvoiceRow = (typeof START)[0];
	const cols: DataColumn<InvoiceRow>[] = [
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
				rowClassName={(x) =>
					pending.indexOf(x.id) >= 0 ? "line-through decoration-tertiary-foreground" : undefined
				}
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
