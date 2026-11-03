# CashFlowReport

Printable Statement of Cash Flows (indirect method): profit before tax, adjustments, working-capital changes, cash generated from operations, interest and tax paid, investing and financing activities, net change, opening and closing cash, with a reconciliation check.

```tsx
import { CashFlowReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { CashFlowReport, DocumentBrandProvider, GroupedTabButton } from "@cynco-labs/ui";

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
	period: { kind: "months", months: 10, end: "2026-10-31" },
	currency: "MYR",
	columns: [{ label: "Jan–Oct 2026" }],
	preparedBy: "Aisyah Rahman, Finance Manager",
	preparedOn: "2026-11-01",
	notes:
		"Cash and cash equivalents comprise cash in hand, the Maybank current account and the Public Bank fixed deposit (3-month tenure).",
	profitBeforeTax: { values: ["331099.05"] },
	adjustments: [
		{ label: "Depreciation of property, plant and equipment", values: ["64800.00"] },
		{ label: "Depreciation of right-of-use assets", values: ["28000.00"] },
		{ label: "Amortisation of intangible assets", values: ["3500.00"] },
		{ label: "Finance costs", values: ["51990.00"] },
		{ label: "Interest income", values: ["-7860.00"] },
	],
	operatingProfitBeforeWorkingCapital: { values: ["471529.05"] },
	workingCapitalChanges: [
		{ label: "(Increase) in inventories", values: ["-81125.50"] },
		{ label: "(Increase) in trade receivables", values: ["-55259.85"] },
		{ label: "(Increase) in other receivables", values: ["-8158.35"] },
		{ label: "Increase in trade payables", values: ["34060.30"] },
		{ label: "Increase in other payables and accruals", values: ["7815.00"] },
		{ label: "Increase in SST payable", values: ["1662.15"] },
	],
	cashGeneratedFromOperations: { values: ["370522.80"] },
	operatingOther: [
		{ label: "Interest paid", values: ["-51990.00"] },
		{ label: "Income tax paid", values: ["-62112.00"] },
	],
	netOperating: { values: ["256420.80"] },
	investing: [
		{ label: "Purchase of property, plant and equipment", values: ["-23000.00"] },
		{ label: "Purchase of intangible assets", values: ["0.00"] },
		{ label: "Interest received", values: ["7860.00"] },
	],
	netInvesting: { values: ["-15140.00"] },
	financing: [
		{ label: "Repayment of term loan", values: ["-50000.00"] },
		{ label: "Repayment of hire purchase payables", values: ["-20000.00"] },
		{ label: "Payment of lease liabilities (principal)", values: ["-26000.00"] },
		{ label: "Dividends paid", values: ["-120000.00"] },
	],
	netFinancing: { values: ["-216000.00"] },
	netChange: { values: ["25280.80"] },
	openingCash: { values: ["254310.85"] },
	closingCash: { values: ["279591.65"] },
	reconciled: true,
};

export default function CashFlowReportDemo() {
	return <Shell render={() => <CashFlowReport report={DATA} />} />;
}
```

## Use

Monthly, year-to-date and annual cash flow statements, single period or with comparatives.

## Props

report: CashFlowData — period, columns, profitBeforeTax, adjustments[], operatingProfitBeforeWorkingCapital, workingCapitalChanges[], cashGeneratedFromOperations, operatingOther?[], netOperating, investing[], netInvesting, financing[], netFinancing, netChange, openingCash, fxEffect?, closingCash, reconciled?, basis?, currency?, filters?, preparedBy?, preparedOn?, notes?; plus brand?, size?, stamp?, fit?, isolate?, className.

- `report`: `CashFlowData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

All layouts and locales; A4; header repeats when printed.

Category: Documents. Source: `packages/ui/src/documents/reports.tsx`.
