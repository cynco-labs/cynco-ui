# BankFeedList

The day-grouped bank transaction stream: search, lifecycle filter, count, and per-day sections of feed rows with the day's net.

```tsx
import { BankFeedList } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

The main Banking feed for one account or all accounts.

## Props

days [{date, net?, rows: BankFeedTransaction[]}], total, statusLabel, search, showAccount, selectedIds / defaultSelectedIds / onSelectionChange, postAll (money summary when filtered to To post), className and native props (spread on the root).

- `days`: `BankFeedDay[]`
- `total`: `number`
- `query?`: `string`. Controlled search query: the list shows the rows you pass, so filter them (or refetch) in `onQueryChange`. Uncontrolled, the list filters by payee, description and reference itself.
- `defaultQuery?`: `string`. Initial search query for uncontrolled use.
- `onQueryChange?`: `(query: string) => void`. Called when the user types in the search box.
- `status?`: `"all" | "posted" | "imported" | "categorized" | "reconciled" | "excluded"`. Controlled status filter: the list shows the rows you pass, so filter them (or refetch) in `onStatusChange`. Uncontrolled, the list filters itself.
- `defaultStatus?`: `"all" | "posted" | "imported" | "categorized" | "reconciled" | "excluded"`. Initial status filter for uncontrolled use.
- `onStatusChange?`: `(status: BankFeedStatus | "all") => void`. Called when the user changes the status filter.
- `showAccount?`: `boolean`. Default `true`.
- `selectedIds?`: `string[]`. Ids of the ticked rows (controlled).
- `defaultSelectedIds?`: `string[]`. Initially ticked row ids when uncontrolled.
- `onSelectionChange?`: `(ids: string[]) => void`. Called with the new ids when a row is ticked or unticked.
- `postAll?`: `string`. "RM 4,210.00 in · RM 1,180.40 out" shown on Post all; omit to hide the button.
- `onPostAll?`: `() => void`. Called when the user clicks "Post all".
- `onRestore?`: `(tx: BankFeedTransaction) => void`. Called from an excluded line's Restore button; omit to hide it.
- Also accepts `ComponentProps<"div">`.

## Notes

Each day's rows are an ARIA grid: the list is one tab stop, arrow keys move down the feed across day boundaries and across a row's cells, Home and End reach the first and last row, and Enter or Space works the focused cell's control. Responsive by container: toolbar wraps (ActionBar), rows switch to the narrow FeedRow layout.

Category: Accounting · Banking. Source: `packages/ui/src/accounting/banking/feed-list.tsx:44-265`.
