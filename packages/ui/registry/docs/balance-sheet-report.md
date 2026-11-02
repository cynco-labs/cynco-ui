# BalanceSheetReport

Printable Statement of Financial Position: non-current and current assets, current and non-current liabilities, equity, the 'Total equity and liabilities' line with an accountant's double rule, and a Balanced / Out-of-balance check.

```tsx
import { BalanceSheetReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { BalanceSheetReport, DocumentBrandProvider, GroupedTabButton } from "@cynco-labs/ui";

const BRAND = {
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

function Shell(p) {
	const [l, setL] = useState("minimal"),
		[g, setG] = useState("en"),
		[x, setX] = useState(p.extra ? p.extra.options[0].value : "");
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
				{p.extra ? (
					<GroupedTabButton
						className="w-[230px]"
						value={x}
						onValueChange={setX}
						options={p.extra.options}
					/>
				) : null}
			</div>
			<DocumentBrandProvider brand={Object.assign({}, BRAND, { layout: l, locale: g })}>
				{p.render(x)}
			</DocumentBrandProvider>
		</div>
	);
}

const DATA = {
	period: { kind: "asAt", end: "2026-10-31" },
	currency: "MYR",
	columns: [{ label: "31 Oct 2026" }, { label: "31 Dec 2025", sublabel: "RM · audited" }],
	preparedBy: "Aisyah Rahman, Finance Manager",
	preparedOn: "2026-11-01",
	notes:
		"Comparative figures as at 31 December 2025 are taken from the audited financial statements.",
	nonCurrentAssets: [
		{ label: "Property, plant and equipment", values: ["1284600.00", "1326400.00"], note: "3" },
		{ label: "Right-of-use assets", values: ["186000.00", "214000.00"], note: "4" },
		{ label: "Intangible assets — software", values: ["24500.00", "28000.00"] },
	],
	totalNonCurrentAssets: { values: ["1495100.00", "1568400.00"] },
	currentAssets: [
		{ label: "Inventories", values: ["862340.50", "781215.00"], note: "7" },
		{ label: "Trade receivables", values: ["524180.25", "468920.40"], note: "8" },
		{ label: "Other receivables, deposits and prepayments", values: ["46718.35", "38560.00"] },
		{ label: "Cash and bank balances", values: ["279591.65", "254310.85"], note: "9" },
	],
	totalCurrentAssets: { values: ["1712830.75", "1543006.25"] },
	totalAssets: { values: ["3207930.75", "3111406.25"] },
	currentLiabilities: [
		{ label: "Trade payables", values: ["386240.60", "352180.30"] },
		{ label: "Other payables and accruals", values: ["92415.00", "84600.00"] },
		{ label: "SST payable", values: ["18642.35", "16980.20"] },
		{ label: "Hire purchase payables", values: ["24000.00", "24000.00"], note: "10" },
		{ label: "Term loan", values: ["60000.00", "60000.00"], note: "11" },
		{ label: "Current tax liabilities", values: ["32180.00", "21450.00"] },
	],
	totalCurrentLiabilities: { values: ["613477.95", "559210.50"] },
	nonCurrentLiabilities: [
		{ label: "Hire purchase payables", values: ["38000.00", "58000.00"], note: "10" },
		{ label: "Term loan", values: ["420000.00", "470000.00"], note: "11" },
		{ label: "Lease liabilities", values: ["156000.00", "182000.00"], note: "4" },
		{ label: "Deferred tax liabilities", values: ["46800.00", "46800.00"] },
	],
	totalNonCurrentLiabilities: { values: ["660800.00", "756800.00"] },
	totalLiabilities: { values: ["1274277.95", "1316010.50"] },
	equity: [
		{ label: "Share capital", values: ["500000.00", "500000.00"], note: "12" },
		{ label: "Retained earnings", values: ["1433652.80", "1295395.75"] },
	],
	totalEquity: { values: ["1933652.80", "1795395.75"] },
	totalEquityAndLiabilities: { values: ["3207930.75", "3111406.25"] },
	balanced: true,
};

export default function BalanceSheetReportDemo() {
	return <Shell render={() => <BalanceSheetReport report={DATA} />} />;
}
```

## Use

Month-end and year-end balance sheets, with a comparative column (e.g. the last audited year end).

## Props

report: BalanceSheetData — period (kind 'asAt'), columns, codes?, nonCurrentAssets[], totalNonCurrentAssets, currentAssets[], totalCurrentAssets, totalAssets, currentLiabilities[], totalCurrentLiabilities, nonCurrentLiabilities[], totalNonCurrentLiabilities, totalLiabilities, equity[], totalEquity, totalEquityAndLiabilities, balanced, difference?, basis?, currency?, filters?, preparedBy?, preparedOn?, notes?; plus brand?, size?, stamp?, fit?, isolate?, className.

- `report`: `BalanceSheetData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `stamp?`: `"paid" | "void" | "draft" | "copy" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

Note references print in a Note column when any line carries one. All three layouts and EN / BM / EN+BM; A4; header repeats when printed.

Category: Documents. Source: `packages/ui/src/documents/reports.tsx`.
