import { type BankFeedDay, BankFeedList, type BankMatch } from "@cynco-labs/ui";

const MATCH_INV: BankMatch = {
	id: "m1",
	targetLabel: "Invoice · TechNova Solutions Sdn Bhd",
	targetReference: "INV-2026-0142",
	confidence: 0.94,
	status: "proposed",
	evidence: ["Amount equal (RM 12,720.00)", "Reference INV-2026-0142 in description", "Paid 2 days after due date"],
	consequence:
		"Accepting records the receipt against INV-2026-0142 and marks it Paid. The line posts to 1200-001 Trade Receivables instead of a revenue account.",
};

const MBB = { name: "Maybank Current", color: "#E5A21F" },
	CIMB = { name: "CIMB Business", color: "#E5484D" };

const DAYS: BankFeedDay[] = [
	{
		date: "2026-10-29",
		net: { amount: "11535.70" },
		rows: [
			{
				id: "t1",
				date: "2026-10-29",
				payeeName: "TechNova Solutions Sdn Bhd",
				description: "IBG CR INV-2026-0142",
				type: "credit",
				amount: 12720,
				status: "imported",
				account: MBB,
				suggestion: { accountCode: "1200-001", accountName: "Trade Receivables", confidence: 0.94 },
				matches: [MATCH_INV],
			},
			{
				id: "t2",
				date: "2026-10-29",
				payeeName: "Tenaga Nasional Berhad",
				description: "JomPAY 5021 TNB",
				type: "debit",
				amount: 1184.3,
				status: "categorized",
				account: MBB,
				category: "6210 Utilities",
			},
		],
	},
	{
		date: "2026-10-28",
		net: null,
		rows: [
			{
				id: "t3",
				date: "2026-10-28",
				payeeName: "Lembaga Hasil Dalam Negeri",
				description: "TAX REFUND LHDN 2025",
				type: "credit",
				amount: 3850,
				status: "categorized",
				account: CIMB,
				category: "4000 Sales Revenue",
				flags: ["government_credit_as_revenue"],
			},
			{
				id: "t4",
				date: "2026-10-28",
				payeeName: null,
				description: "TRF TO CIMB BUSINESS 8800",
				reference: "FT26102814",
				type: "debit",
				amount: 20000,
				status: "posted",
				account: MBB,
				isTransfer: true,
				category: "1010 CIMB Business",
			},
			{
				id: "t5",
				date: "2026-10-28",
				payeeName: "Grab Malaysia",
				description: "GRABPAY*RIDE KL",
				type: "debit",
				amount: 38.5,
				status: "imported",
				account: CIMB,
				suggestion: { accountName: "Travel & Transport", confidence: 0.72 },
			},
		],
	},
];

export default function BankFeedListDemo() {
	return <BankFeedList onRestore={() => {}} days={DAYS} total={248} showAccount defaultSelectedIds={["t2"]} />;
}
