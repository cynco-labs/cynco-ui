# ProfitAndLossReport

Printable Statement of Profit or Loss: revenue, cost of sales, gross profit, grouped operating expenses, operating profit, other income and finance costs, profit before tax, tax and profit for the period, with comparative period, variance and variance %.

```tsx
import { ProfitAndLossReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { DocumentBrandProvider, GroupedTabButton, ProfitAndLossReport } from "@cynco-labs/ui";

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
	period: { kind: "month", end: "2026-10-31" },
	basis: "accrual",
	currency: "MYR",
	columns: [{ label: "Oct 2026" }, { label: "Oct 2025" }],
	variance: true,
	filters: [
		{ label: "Branch", value: "All branches" },
		{ label: "Department", value: "All" },
	],
	preparedBy: "Aisyah Rahman, Finance Manager",
	preparedOn: "2026-11-01",
	notes:
		"Management accounts — unaudited. Income tax is provided at the expected effective rate of 22% for YA 2026. Note references are to the notes in the year-end financial statements.",
	revenue: [
		{
			code: "4000-001",
			label: "Sales — furniture (local)",
			values: ["368450.00", "321780.00"],
			variance: "46670.00",
			variancePct: "14.5",
		},
		{
			code: "4000-002",
			label: "Sales — export",
			values: ["52300.00", "61200.00"],
			variance: "-8900.00",
			variancePct: "-14.5",
		},
		{
			code: "4100-001",
			label: "Installation and delivery income",
			values: ["14860.00", "11240.00"],
			variance: "3620.00",
			variancePct: "32.2",
		},
		{
			code: "4900-001",
			label: "Sales returns and discounts",
			values: ["-6215.00", "-4980.00"],
			variance: "-1235.00",
			variancePct: "-24.8",
		},
	],
	totalRevenue: { values: ["429395.00", "389240.00"], variance: "40155.00", variancePct: "10.3" },
	costOfSales: [
		{
			code: "5000-001",
			label: "Cost of goods sold",
			values: ["-232640.00", "-205310.00"],
			variance: "-27330.00",
			variancePct: "-13.3",
		},
		{
			code: "5100-001",
			label: "Direct labour",
			values: ["-28400.00", "-26150.00"],
			variance: "-2250.00",
			variancePct: "-8.6",
		},
		{
			code: "5200-001",
			label: "Freight inwards and import duties",
			values: ["-9870.00", "-8640.00"],
			variance: "-1230.00",
			variancePct: "-14.2",
		},
	],
	totalCostOfSales: {
		values: ["-270910.00", "-240100.00"],
		variance: "-30810.00",
		variancePct: "-12.8",
	},
	grossProfit: { values: ["158485.00", "149140.00"], variance: "9345.00", variancePct: "6.3" },
	operatingExpenses: [
		{
			label: "Staff costs",
			lines: [
				{
					code: "6100-001",
					label: "Salaries and wages",
					values: ["-48600.00", "-44200.00"],
					variance: "-4400.00",
					variancePct: "-10.0",
				},
				{
					code: "6100-002",
					label: "EPF, SOCSO and EIS",
					values: ["-6912.40", "-6284.60"],
					variance: "-627.80",
					variancePct: "-10.0",
				},
				{
					code: "6100-003",
					label: "Staff welfare and HRDF levy",
					values: ["-1850.00", "-2120.00"],
					variance: "270.00",
					variancePct: "12.7",
				},
			],
			total: { values: ["-57362.40", "-52604.60"], variance: "-4757.80", variancePct: "-9.0" },
		},
		{
			label: "Premises",
			lines: [
				{
					code: "6200-001",
					label: "Rental — factory and showroom",
					values: ["-18500.00", "-18500.00"],
					variance: "0.00",
					variancePct: "0.0",
				},
				{
					code: "6200-002",
					label: "Utilities (TNB, Air Selangor)",
					values: ["-4386.55", "-3912.30"],
					variance: "-474.25",
					variancePct: "-12.1",
				},
				{
					code: "6200-003",
					label: "Repairs and maintenance",
					values: ["-1240.00", "-2860.00"],
					variance: "1620.00",
					variancePct: "56.6",
				},
			],
			total: { values: ["-24126.55", "-25272.30"], variance: "1145.75", variancePct: "4.5" },
		},
		{
			label: "Selling and distribution",
			lines: [
				{
					code: "6300-001",
					label: "Advertising and promotion",
					values: ["-7450.00", "-5200.00"],
					variance: "-2250.00",
					variancePct: "-43.3",
				},
				{
					code: "6300-002",
					label: "Sales commission",
					values: ["-8420.00", "-7310.00"],
					variance: "-1110.00",
					variancePct: "-15.2",
				},
				{
					code: "6300-003",
					label: "Delivery and transport",
					values: ["-5680.20", "-4950.80"],
					variance: "-729.40",
					variancePct: "-14.7",
				},
			],
			total: { values: ["-21550.20", "-17460.80"], variance: "-4089.40", variancePct: "-23.4" },
		},
		{
			label: "Administrative",
			lines: [
				{
					code: "6400-001",
					label: "Audit and professional fees",
					values: ["-2500.00", "-2500.00"],
					variance: "0.00",
					variancePct: "0.0",
				},
				{
					code: "6400-002",
					label: "Software subscriptions",
					values: ["-1180.00", "-890.00"],
					variance: "-290.00",
					variancePct: "-32.6",
				},
				{
					code: "6400-003",
					label: "Insurance",
					values: ["-1325.00", "-1250.00"],
					variance: "-75.00",
					variancePct: "-6.0",
				},
				{
					code: "6400-004",
					label: "Bank charges",
					values: ["-412.35", "-386.10"],
					variance: "-26.25",
					variancePct: "-6.8",
				},
				{
					code: "6500-001",
					label: "Depreciation and amortisation",
					values: ["-9930.00", "-9210.00"],
					variance: "-720.00",
					variancePct: "-7.8",
					note: "5",
				},
			],
			total: { values: ["-15347.35", "-14236.10"], variance: "-1111.25", variancePct: "-7.8" },
		},
	],
	totalOperatingExpenses: {
		values: ["-118386.50", "-109573.80"],
		variance: "-8812.70",
		variancePct: "-8.0",
	},
	operatingProfit: { values: ["40098.50", "39566.20"], variance: "532.30", variancePct: "1.3" },
	otherIncome: [
		{
			code: "7100-001",
			label: "Interest income — fixed deposit",
			values: ["820.00", "640.00"],
			variance: "180.00",
			variancePct: "28.1",
		},
		{
			code: "7100-002",
			label: "Realised foreign exchange gain/(loss)",
			values: ["-1135.40", "2280.00"],
			variance: "-3415.40",
			variancePct: "-149.8",
		},
	],
	otherExpenses: [
		{
			code: "8100-001",
			label: "Hire purchase interest",
			values: ["-1264.00", "-1410.00"],
			variance: "146.00",
			variancePct: "10.4",
		},
		{
			code: "8100-002",
			label: "Term loan interest",
			values: ["-2980.00", "-3240.00"],
			variance: "260.00",
			variancePct: "8.0",
		},
		{
			code: "8100-003",
			label: "Lease interest",
			values: ["-760.00", "-880.00"],
			variance: "120.00",
			variancePct: "13.6",
		},
	],
	profitBeforeTax: { values: ["34779.10", "36956.20"], variance: "-2177.10", variancePct: "-5.9" },
	tax: [
		{
			code: "8800-001",
			label: "Income tax expense (estimated)",
			values: ["-7651.00", "-8130.00"],
			variance: "479.00",
			variancePct: "5.9",
			note: "6",
		},
	],
	netProfit: { values: ["27128.10", "28826.20"], variance: "-1698.10", variancePct: "-5.9" },
};

export default function ProfitAndLossReportDemo() {
	return <Shell render={() => <ProfitAndLossReport report={DATA} />} />;
}
```

## Use

Monthly management accounts, year-to-date and annual P&L packs, board papers — anywhere the P&L leaves Cynco as paper or PDF.

## Props

report: ProfitAndLossData — period {kind, end, start?, months?}, basis?, currency?, filters?, title?, columns [{label, sublabel?}], variance?, codes?, revenue[], totalRevenue, costOfSales[], totalCostOfSales, grossProfit, operatingExpenses [{label, lines[], total, totalLabel?}], totalOperatingExpenses, operatingProfit, otherIncome?, otherExpenses?, profitBeforeTax, tax[], netProfit, preparedBy?, preparedOn?, notes? (lines are {label, code?, note?, values[], variance?, variancePct?}); plus brand?, size?, stamp?, fit?, isolate?, className.

- `report`: `ProfitAndLossData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `stamp?`: `"paid" | "void" | "draft" | "copy" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

Built from ReportHeader + StatementTable + ReportFooter on the kit's DocumentPage. Minimal / classic / modern in black ink only, any font, EN / BM / EN+BM (row and column labels stacked bilingually). Costs are passed as negative figures and print in brackets; every total and variance is printed as given, never recomputed. Gross/operating/pre-tax/net labels switch to 'loss' when the given figure is negative. A4 by default; the column header repeats on each printed page, totals avoid starting a page.

Category: Documents. Source: `packages/ui/src/documents/reports.tsx`.
