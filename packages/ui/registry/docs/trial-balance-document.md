# TrialBalanceDocument

Printable trial balance: account code, account name, debit and credit grouped by account type, matching totals with a double rule, and a quiet 'Balanced' or red 'Out of balance by RM x' line.

```tsx
import { TrialBalanceDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import {
	DocumentBrandProvider,
	GroupedTabButton,
	TrialBalanceDocument,
	sumAmounts,
	type DocLayout,
	type DocLocale,
	type TrialBalanceData,
	type DocBrand,
} from "@cynco-labs/ui";

const BRAND: DocBrand = {
	company: {
		name: "Harmoni Perabot Sdn Bhd",
		registrationNo: "201801034567 (1290456-T)",
		sstNo: "P11-1809-32001234",
		tin: "C23456789010",
		address: ["Lot 15, Jalan Perindustrian Bukit Minyak 7", "14100 Simpang Ampat, Pulau Pinang"],
		phone: "+60 4-508 2210",
		email: "finance@harmoniperabot.my",
	},
	layout: "minimal",
	locale: "en",
	footerNote: "Thank you for your business.",
};

type ShellProps = {
	extra?: { options: { value: string; label: string }[] };
	render: (x: string) => React.ReactNode;
};

function Shell({ extra, render }: ShellProps) {
	const [l, setL] = useState<DocLayout>("minimal"),
		[g, setG] = useState<DocLocale>("en"),
		[x, setX] = useState(extra ? extra.options[0].value : "");
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap gap-2">
				<GroupedTabButton
					className="min-w-[260px] flex-1"
					value={l}
					onValueChange={setL}
					options={[
						{ value: "minimal", label: "Minimal" },
						{ value: "classic", label: "Classic" },
						{ value: "modern", label: "Modern" },
					]}
				/>
				<GroupedTabButton
					className="w-[190px]"
					value={g}
					onValueChange={setG}
					options={[
						{ value: "en", label: "EN" },
						{ value: "ms", label: "BM" },
						{ value: "en-ms", label: "EN+BM" },
					]}
				/>
				{extra ? (
					<GroupedTabButton
						className="w-[230px]"
						value={x}
						onValueChange={setX}
						options={extra.options}
					/>
				) : null}
			</div>
			<DocumentBrandProvider brand={{ ...BRAND, layout: l, locale: g }}>
				{render(x)}
			</DocumentBrandProvider>
		</div>
	);
}

const DATA: TrialBalanceData = {
	period: { kind: "asAt", end: "2026-10-31" },
	currency: "MYR",
	preparedBy: "Aisyah Rahman",
	preparedOn: "2026-11-01",
	accounts: [
		{ code: "1000-001", name: "Maybank current account", group: "assets", debit: "127091.65" },
		{ code: "1000-002", name: "Public Bank fixed deposit", group: "assets", debit: "150000.00" },
		{ code: "1000-003", name: "Petty cash", group: "assets", debit: "2500.00" },
		{ code: "1100-001", name: "Trade receivables", group: "assets", debit: "524180.25" },
		{
			code: "1150-001",
			name: "Other receivables, deposits and prepayments",
			group: "assets",
			debit: "46718.35",
		},
		{ code: "1300-001", name: "Inventories — finished goods", group: "assets", debit: "862340.50" },
		{
			code: "1500-001",
			name: "Property, plant and equipment — cost",
			group: "assets",
			debit: "2148600.00",
		},
		{
			code: "1500-901",
			name: "Accumulated depreciation — PPE",
			group: "assets",
			credit: "864000.00",
		},
		{ code: "1600-001", name: "Right-of-use assets", group: "assets", debit: "186000.00" },
		{ code: "1700-001", name: "Intangible assets — software", group: "assets", debit: "24500.00" },
		{ code: "2000-001", name: "Trade payables", group: "liabilities", credit: "386240.60" },
		{ code: "2100-001", name: "Short-term borrowings", group: "liabilities", credit: "250000.00" },
		{ code: "2200-001", name: "SST payable", group: "liabilities", credit: "18720.40" },
		{
			code: "2300-001",
			name: "EPF, SOCSO & EIS payable",
			group: "liabilities",
			credit: "47130.00",
		},
		{
			code: "2400-001",
			name: "Lease liabilities — current",
			group: "liabilities",
			credit: "38400.00",
		},
		{
			code: "2500-001",
			name: "Term loan — current portion",
			group: "liabilities",
			credit: "120000.00",
		},
		{
			code: "2600-001",
			name: "Term loan — non-current",
			group: "liabilities",
			credit: "480000.00",
		},
		{
			code: "2601-001",
			name: "Lease liabilities — non-current",
			group: "liabilities",
			credit: "147600.00",
		},
		{ code: "3000-001", name: "Share capital", group: "equity", credit: "500000.00" },
		{ code: "3100-001", name: "Retained earnings", group: "equity", credit: "1247008.35" },
		{
			code: "4000-001",
			name: "Sales — furniture and fittings",
			group: "revenue",
			credit: "3846180.00",
		},
		{ code: "4100-001", name: "Sales — custom joinery", group: "revenue", credit: "131450.00" },
		{ code: "4900-001", name: "Sales returns and discounts", group: "revenue", debit: "58940.00" },
		{ code: "5000-001", name: "Cost of goods sold", group: "costOfSales", debit: "2198760.40" },
		{ code: "5100-001", name: "Direct labour", group: "costOfSales", debit: "276150.00" },
		{
			code: "5200-001",
			name: "Freight inwards and import duties",
			group: "costOfSales",
			debit: "94215.60",
		},
		{ code: "6100-001", name: "Salaries and wages", group: "expenses", debit: "471300.00" },
		{ code: "6100-002", name: "EPF, SOCSO and EIS", group: "expenses", debit: "67024.80" },
		{ code: "6100-003", name: "Staff welfare and HRDF levy", group: "expenses", debit: "19640.00" },
		{
			code: "6200-001",
			name: "Rental — factory and showroom",
			group: "expenses",
			debit: "185000.00",
		},
		{
			code: "6200-002",
			name: "Utilities (TNB, Air Selangor)",
			group: "expenses",
			debit: "41870.25",
		},
		{ code: "6200-003", name: "Repairs and maintenance", group: "expenses", debit: "18420.00" },
		{ code: "6300-001", name: "Advertising and promotion", group: "expenses", debit: "62300.00" },
		{ code: "6300-002", name: "Sales commission", group: "expenses", debit: "79860.00" },
		{ code: "6300-003", name: "Delivery and transport", group: "expenses", debit: "53115.40" },
		{ code: "6400-001", name: "Audit and professional fees", group: "expenses", debit: "25000.00" },
		{ code: "6400-002", name: "Software subscriptions", group: "expenses", debit: "11440.00" },
		{ code: "6400-003", name: "Insurance", group: "expenses", debit: "13250.00" },
		{ code: "6400-004", name: "Bank charges", group: "expenses", debit: "4108.90" },
		{
			code: "6500-001",
			name: "Depreciation and amortisation",
			group: "expenses",
			debit: "96300.00",
		},
		{
			code: "7100-001",
			name: "Interest income — fixed deposit",
			group: "otherIncomeAndExpenses",
			credit: "7860.00",
		},
		{
			code: "7100-002",
			name: "Realised foreign exchange gain/(loss)",
			group: "otherIncomeAndExpenses",
			debit: "3420.60",
		},
		{
			code: "8100-001",
			name: "Hire purchase interest",
			group: "otherIncomeAndExpenses",
			debit: "13140.00",
		},
		{
			code: "8100-002",
			name: "Term loan interest",
			group: "otherIncomeAndExpenses",
			debit: "30750.00",
		},
		{ code: "8100-003", name: "Lease interest", group: "otherIncomeAndExpenses", debit: "8100.00" },
		{
			code: "8800-001",
			name: "Income tax expense (estimated)",
			group: "taxation",
			debit: "72842.00",
		},
	],
	totalDebit: "8096878.70",
	totalCredit: "8096878.70",
	balanced: true,
};

const OUT: TrialBalanceData = {
	...DATA,
	balanced: false,
	difference: "120.00",
	totalCredit: sumAmounts([DATA.totalCredit, "-120.00"]),
	accounts: DATA.accounts.map((a) =>
		a.code === "2100-001" ? { ...a, credit: sumAmounts([a.credit, "-120.00"]) } : a,
	),
};

export default function TrialBalanceDocumentDemo() {
	return (
		<Shell
			extra={{
				options: [
					{ value: "ok", label: "Balanced" },
					{ value: "out", label: "Out of balance" },
				],
			}}
			render={(x) => <TrialBalanceDocument report={x === "out" ? OUT : DATA} />}
		/>
	);
}
```

## Use

Month-end close packs, auditor requests, the TB attached to journals. (Named …Document because TrialBalanceReport is the on-screen report.)

## Props

report: TrialBalanceData — period, accounts [{code, name, group?, debit?, credit?}], totalDebit, totalCredit, balanced, difference?, basis?, currency?, filters?, preparedBy?, preparedOn?, notes?; plus brand?, size?, stamp?, fit?, isolate?, className.

- `report`: `TrialBalanceData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

Consecutive accounts with the same group print under one heading (group can be a label key like 'assets', 'costOfSales', 'expenses'). Empty Dr/Cr sides stay blank, rows are hairline-ruled for long lists. Balanced state is a data flag, never derived. All layouts and locales; A4, header repeats across pages.

Category: Documents. Source: `packages/ui/src/documents/reports.tsx`.
