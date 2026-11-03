import { useState } from "react";
import { CommandPalette, CommandPaletteTrigger, Kbd } from "@cynco-labs/ui";

const recent = [
	{
		id: "142",
		type: "invoice",
		number: "INV-2026-0142",
		label: "Syarikat Maju Jaya Sdn Bhd",
		status: "finalized",
		amount: "12850.00",
	},
	{
		id: "140",
		type: "invoice",
		number: "INV-2026-0140",
		label: "Tropika Kopi Enterprise",
		status: "overdue",
		amount: "3240.00",
	},
	{
		id: "b88",
		type: "bill",
		number: "BILL-2026-0088",
		label: "TNB — electricity, Oct",
		status: "draft",
		amount: "1186.40",
	},
	{ id: "c12", type: "customer", label: "Nusantara Logistik Bhd", keywords: ["NLB", "logistics"] },
	{
		id: "je31",
		type: "journal",
		number: "JE-2026-0031",
		label: "Accrued audit fee, Oct",
		amount: "4500.00",
	},
	{ id: "v7", type: "vendor", label: "Pejabat Digital Supplies Sdn Bhd", keywords: ["stationery"] },
	{
		id: "139",
		type: "invoice",
		number: "INV-2026-0139",
		label: "Nusantara Logistik Bhd",
		status: "paid",
		amount: "28400.00",
	},
];

export default function CommandPaletteDemo() {
	const [open, setOpen] = useState(false);
	const [last, setLast] = useState("Nothing yet");
	const [sandbox, setSandbox] = useState(false);
	function onSelect(item) {
		if (item.id === "act-theme") {
			const d = document.documentElement;
			d.setAttribute("data-theme", d.getAttribute("data-theme") === "dark" ? "light" : "dark");
		}
		if (item.id === "act-sandbox") {
			setSandbox(!sandbox);
		}
		setLast(
			item.record
				? "Opened " + (item.record.number || item.record.label)
				: item.href
					? item.label + " → " + item.href
					: item.label,
		);
	}
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
				<span className="text-sm font-semibold text-foreground">Cynco</span>
				{sandbox && (
					<span className="rounded-md bg-active-primary px-1.5 text-xs text-primary">Sandbox</span>
				)}
				<CommandPaletteTrigger
					onClick={() => {
						setOpen(true);
					}}
					className="ml-auto max-w-[18rem]"
				/>
			</div>
			<p className="text-xs text-tertiary-foreground">
				{"Try: "}
				<Kbd keys="mod+k" />
				{" or the search field; type “inv 0142”, “3240”, “gl”, or “>” for actions. "}
				<span aria-live="polite" className="text-muted-foreground">
					{"Last: "}
					<span className="text-foreground">{last}</span>
				</span>
			</p>
			<CommandPalette open={open} onOpenChange={setOpen} recent={recent} onSelect={onSelect} />
			<div className="text-xs font-medium text-tertiary-foreground">
				Inline (inline prop) — same palette embedded in a page
			</div>
			<CommandPalette inline recent={recent} onSelect={onSelect} />
		</div>
	);
}
