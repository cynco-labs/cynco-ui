import { BankFeedRow, type BankFeedTransaction } from "@cynco-labs/ui";

export default function BankFeedRowDemo() {
	const rows: BankFeedTransaction[] = [
		{
			id: "a",
			date: "2026-10-29",
			payeeName: "Petronas Dagangan Bhd",
			description: "POS PETRONAS SS2 PJ",
			type: "debit",
			amount: 182.4,
			status: "imported",
			account: { name: "Maybank Current", color: "#E5A21F" },
			suggestion: { accountName: "Motor Vehicle Expenses", confidence: 0.91 },
		},
		{
			id: "b",
			date: "2026-10-29",
			payeeName: "Syarikat Bekalan Air Selangor",
			description: "JomPAY 6033 AIR SELANGOR",
			type: "debit",
			amount: 96.2,
			status: "categorized",
			account: { name: "Maybank Current", color: "#E5A21F" },
			category: "6210 Utilities",
			flags: ["unusually_large"],
		},
		{
			id: "c",
			date: "2026-10-28",
			payeeName: "Ahmad Faizal bin Rahman",
			description: "DUITNOW REFUND",
			type: "credit",
			amount: 450,
			status: "categorized",
			account: { name: "CIMB Business", color: "#E5484D" },
			category: "6400 Office Supplies",
			flags: ["money_in_to_expense"],
		},
		{
			id: "d",
			date: "2026-10-28",
			payeeName: null,
			description: "SERVICE CHARGE OCT",
			reference: "SC-1026",
			type: "debit",
			amount: 12,
			status: "reconciled",
			account: { name: "CIMB Business", color: "#E5484D" },
			category: "6800 Bank Charges",
		},
		{
			id: "e",
			date: "2026-10-27",
			payeeName: "Lazada",
			description: "LZD*ORDER 2210",
			type: "debit",
			amount: 89.9,
			status: "excluded",
			excludeReason: "duplicate of line 41",
			account: { name: "CIMB Business", color: "#E5484D" },
		},
		{
			id: "f",
			date: "2026-10-27",
			payeeName: "Unknown sender",
			description: "IBG CR 991204",
			type: "credit",
			amount: 2400,
			status: "imported",
			account: { name: "Maybank Current", color: "#E5A21F" },
		},
	];
	return (
		<div className="rounded-lg border border-table-surface-border bg-table-surface overflow-hidden">
			{rows.map((r) => (
				<BankFeedRow key={r.id} tx={r} showAccount onRestore={() => {}} />
			))}
		</div>
	);
}
