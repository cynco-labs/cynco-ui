import { useState } from "react";
import { CommandPalette, CommandPaletteTrigger, Kbd } from "@cynco-labs/ui";
import {
	BankIcon,
	BooksIcon,
	ChartLineUpIcon,
	CircleHalfIcon,
	FlaskIcon,
	HandCoinsIcon,
	HouseIcon,
	InvoiceIcon,
	KeyboardIcon,
	NotebookIcon,
	PlusIcon,
	ReceiptIcon,
	ScalesIcon,
	UserIcon,
	UserPlusIcon,
} from "@phosphor-icons/react";

// Your app's places, create actions and commands. `shortcut` shows a keycap; route in onSelect.
const items = [
	{ id: "go-dashboard", group: "Go to", label: "Dashboard", href: "/dashboard", icon: <HouseIcon />, keywords: ["home", "overview"], shortcut: "g d" },
	{ id: "go-invoices", group: "Go to", label: "Invoices", href: "/invoices", icon: <InvoiceIcon />, keywords: ["billing", "sales", "receivables"], shortcut: "g i" },
	{ id: "go-bills", group: "Go to", label: "Bills", href: "/bills", icon: <ReceiptIcon />, keywords: ["expenses", "payables"] },
	{ id: "go-customers", group: "Go to", label: "Customers", href: "/customers", icon: <UserIcon />, keywords: ["clients"], shortcut: "g c" },
	{ id: "go-ledger", group: "Go to", label: "General ledger", href: "/ledger", icon: <BooksIcon />, keywords: ["GL", "transactions"] },
	{ id: "go-banking", group: "Go to", label: "Banking", href: "/banking", icon: <BankIcon />, keywords: ["reconcile", "feeds"], shortcut: "g b" },
	{ id: "go-pl", group: "Go to", label: "Profit & loss", href: "/reports/profit-loss", icon: <ChartLineUpIcon />, keywords: ["P&L", "income statement"] },
	{ id: "go-tb", group: "Go to", label: "Trial balance", href: "/reports/trial-balance", icon: <ScalesIcon />, keywords: ["TB"] },
	{ id: "new-invoice", group: "Create", label: "New invoice", href: "/invoices/new", icon: <PlusIcon />, keywords: ["create"], shortcut: "c i" },
	{ id: "new-journal", group: "Create", label: "New journal entry", href: "/journal/new", icon: <NotebookIcon />, keywords: ["JE", "manual"], shortcut: "c j" },
	{ id: "record-payment", group: "Create", label: "Record payment", href: "/invoices?action=payment", icon: <HandCoinsIcon />, keywords: ["receive", "collect"] },
	{ id: "new-customer", group: "Create", label: "New customer", href: "/customers/new", icon: <UserPlusIcon />, keywords: ["client"] },
	{ id: "act-sandbox", group: "Actions", label: "Switch to sandbox", icon: <FlaskIcon />, keywords: ["test", "demo"] },
	{ id: "act-theme", group: "Actions", label: "Toggle theme", icon: <CircleHalfIcon />, keywords: ["dark", "light"] },
	{ id: "act-shortcuts", group: "Actions", label: "Keyboard shortcuts", icon: <KeyboardIcon />, keywords: ["help", "keys"], shortcut: "?" },
];

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
			<CommandPalette open={open} onOpenChange={setOpen} items={items} recent={recent} onSelect={onSelect} />
			<div className="text-xs font-medium text-tertiary-foreground">
				Inline (inline prop) — same palette embedded in a page
			</div>
			<CommandPalette inline items={items} recent={recent} onSelect={onSelect} />
		</div>
	);
}
