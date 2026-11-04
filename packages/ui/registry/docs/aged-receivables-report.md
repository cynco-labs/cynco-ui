# AgedReceivablesReport

Printable aged receivables by customer: current, 1–30, 31–60, 61–90 and 90+ days with a total column, a totals row with double rule, a % of total row, and a bucket summary of totals and shares.

```tsx
import { AgedReceivablesReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	type AgedReceivablesData,
	AgedReceivablesReport,
	type DocBrand,
	type DocLayout,
	type DocLocale,
	DocumentBrandProvider,
	GroupedTabButton,
} from "@cynco-labs/ui";
import type React from "react";
import { useState } from "react";

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

function Shell(p: { render: (x: string) => React.ReactNode; extra?: { options: { value: string; label: string }[] } }) {
	const [l, setL] = useState<DocLayout>("minimal"),
		[g, setG] = useState<DocLocale>("en"),
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
					<GroupedTabButton className="w-[230px]" value={x} onValueChange={setX} options={p.extra.options} />
				) : null}
			</div>
			<DocumentBrandProvider brand={{ ...BRAND, layout: l, locale: g }}>{p.render(x)}</DocumentBrandProvider>
		</div>
	);
}

const DATA: AgedReceivablesData = {
	period: { kind: "asAt", end: "2026-10-31" },
	currency: "MYR",
	filters: [
		{ label: "Ageing by", value: "Due date" },
		{ label: "Customers", value: "Open balances only" },
	],
	preparedBy: "Lim Wei Ling, Credit Control",
	preparedOn: "2026-11-01",
	notes:
		"Wong & Partners Architects (over 90 days) is with our solicitors; a specific allowance will be considered at year end.",
	customers: [
		{
			name: "Nusantara Logistik Bhd",
			detail: "C-0012 · Net 30",
			current: "64847.99",
			days1to30: "29476.35",
			days31to60: "14148.64",
			days61to90: "5895.27",
			over90: "3537.16",
			total: "117905.41",
		},
		{
			name: "Hotel Seri Pinang Sdn Bhd",
			detail: "C-0027 · Net 45",
			current: "38369.30",
			days1to30: "33573.11",
			days31to60: "14388.47",
			days61to90: "9592.31",
			over90: "0.00",
			total: "95923.19",
		},
		{
			name: "IKEO Home Solutions Sdn Bhd",
			detail: "C-0031 · Net 30",
			current: "57354.15",
			days1to30: "24580.35",
			days31to60: "0.00",
			days61to90: "0.00",
			over90: "0.00",
			total: "81934.50",
		},
		{
			name: "Rumah Idaman Interior",
			detail: "C-0044 · Net 30",
			current: "8792.96",
			days1to30: "13189.47",
			days31to60: "10991.20",
			days61to90: "6594.72",
			over90: "4396.48",
			total: "43964.83",
		},
		{
			name: "Syarikat Kayu Jati Utara",
			detail: "C-0051 · Net 60",
			current: "15287.73",
			days1to30: "10191.81",
			days31to60: "10191.81",
			days61to90: "5095.90",
			over90: "10191.81",
			total: "50959.06",
		},
		{
			name: "Penang Cohort Co-Working Sdn Bhd",
			detail: "C-0058 · Net 30",
			current: "17985.09",
			days1to30: "0.00",
			days31to60: "0.00",
			days61to90: "0.00",
			over90: "0.00",
			total: "17985.09",
		},
		{
			name: "Klinik Pergigian Senyum",
			detail: "C-0063 · COD",
			current: "0.00",
			days1to30: "0.00",
			days31to60: "2797.88",
			days61to90: "2098.40",
			over90: "2098.40",
			total: "6994.68",
		},
		{
			name: "Universiti Teknologi Lestari",
			detail: "C-0070 · Net 60",
			current: "22981.56",
			days1to30: "22981.56",
			days31to60: "0.00",
			days61to90: "0.00",
			over90: "0.00",
			total: "45963.12",
		},
		{
			name: "Grand Borneo Resort Sdn Bhd",
			detail: "C-0074 · Net 45",
			current: "17086.27",
			days1to30: "11390.83",
			days31to60: "9492.36",
			days61to90: "0.00",
			over90: "0.00",
			total: "37969.46",
		},
		{
			name: "Butterworth Office Supplies",
			detail: "C-0081 · Net 30",
			current: "9592.60",
			days1to30: "2398.14",
			days31to60: "0.00",
			days61to90: "0.00",
			over90: "0.00",
			total: "11990.74",
		},
		{
			name: "Taman Desa Property Management",
			detail: "C-0088 · Net 30",
			current: "5395.25",
			days1to30: "0.00",
			days31to60: "3596.82",
			days61to90: "0.00",
			over90: "0.00",
			total: "8992.07",
		},
		{
			name: "Wong & Partners Architects",
			detail: "C-0092 · Net 30",
			current: "0.00",
			days1to30: "0.00",
			days31to60: "0.00",
			days61to90: "0.00",
			over90: "3598.10",
			total: "3598.10",
		},
	],
	totals: {
		current: "257692.90",
		days1to30: "147781.62",
		days31to60: "65607.18",
		days61to90: "29276.60",
		over90: "23821.95",
		total: "524180.25",
	},
	percentages: {
		current: "49.2",
		days1to30: "28.2",
		days31to60: "12.5",
		days61to90: "5.6",
		over90: "4.5",
		total: "100.0",
	},
};

export default function AgedReceivablesReportDemo() {
	return <Shell render={() => <AgedReceivablesReport report={DATA} />} />;
}
```

## Use

Credit-control meetings, month-end receivables review, bank covenant and auditor packs.

## Props

report: AgedReceivablesData — period (kind 'asAt'), customers [{name, detail?, current, days1to30, days31to60, days61to90, over90, total}], totals {…same buckets}, percentages {…same buckets, e.g. '49.2'}, summary?, basis?, currency?, filters?, preparedBy?, preparedOn?, notes?; plus brand?, size?, stamp?, fit?, isolate?, className.

- `report`: `AgedReceivablesData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

The bucket summary prints each bucket's total and share of the whole. Percentages are supplied by the ledger, not calculated. Customer detail line suits code and terms ('C-0012 · Net 30'). A4 portrait by default (very long names wrap; pass size='a4-landscape' for wide ledgers).

Category: Documents. Source: `packages/ui/src/documents/reports.tsx:1137-1158`.
