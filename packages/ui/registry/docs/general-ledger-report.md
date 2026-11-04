# GeneralLedgerReport

Printable general ledger: per account a header with code, name and opening balance, dated lines with journal no., description, debit, credit and running balance (Dr/Cr), and a closing-balance row with period totals.

```tsx
import { GeneralLedgerReport } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	type DocBrand,
	type DocLayout,
	type DocLocale,
	DocumentBrandProvider,
	type GeneralLedgerData,
	GeneralLedgerReport,
	GroupedTabButton,
} from "@cynco-labs/ui";
import type * as React from "react";
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

type ShellOption = { value: string; label: string };
type ShellProps = { extra?: { options: ShellOption[] }; render: (x: string) => React.ReactNode };
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
				{extra ? <GroupedTabButton className="w-[230px]" value={x} onValueChange={setX} options={extra.options} /> : null}
			</div>
			<DocumentBrandProvider brand={Object.assign({}, BRAND, { layout: l, locale: g })}>{render(x)}</DocumentBrandProvider>
		</div>
	);
}

const DATA: GeneralLedgerData = {
	period: { kind: "range", start: "2026-10-01", end: "2026-10-31" },
	currency: "MYR",
	filters: [
		{ label: "Accounts", value: "1000-001, 1100-001, 6200-002" },
		{ label: "Source", value: "All journals" },
	],
	preparedBy: "Lim Wei Ling, Accounts Executive",
	preparedOn: "2026-11-01",
	accounts: [
		{
			code: "1000-001",
			name: "Maybank current account",
			openingBalance: "98860.60",
			lines: [
				{
					date: "2026-10-01",
					journalNo: "PV-2026-2261",
					description: "Payment — Kilang Papan Sri Kedah",
					balance: "86662.23",
					credit: "12198.37",
				},
				{
					date: "2026-10-02",
					journalNo: "PV-2026-2262",
					description: "Payment — Pos Laju courier",
					balance: "65354.83",
					credit: "21307.40",
				},
				{
					date: "2026-10-05",
					journalNo: "OR-2026-4411",
					description: "Receipt — Rumah Idaman Interior",
					balance: "72291.58",
					debit: "6936.75",
				},
				{
					date: "2026-10-05",
					journalNo: "PV-2026-2263",
					description: "Payment — Pos Laju courier",
					balance: "52640.02",
					credit: "19651.56",
				},
				{
					date: "2026-10-06",
					journalNo: "JV-2026-1181",
					description: "Cash sale — showroom (DuitNow)",
					balance: "60436.35",
					debit: "7796.33",
				},
				{
					date: "2026-10-06",
					journalNo: "OR-2026-4412",
					description: "Receipt — Rumah Idaman Interior",
					balance: "67724.06",
					debit: "7287.71",
				},
				{
					date: "2026-10-07",
					journalNo: "OR-2026-4413",
					description: "Receipt — Nusantara Logistik Bhd",
					balance: "93432.54",
					debit: "25708.48",
				},
				{
					date: "2026-10-07",
					journalNo: "OR-2026-4414",
					description: "Receipt — Klinik Pergigian Senyum",
					balance: "105517.37",
					debit: "12084.83",
				},
				{
					date: "2026-10-07",
					journalNo: "PV-2026-2264",
					description: "Salary payment — September 2026",
					balance: "53036.77",
					credit: "52480.60",
				},
				{
					date: "2026-10-08",
					journalNo: "JV-2026-1182",
					description: "FPX settlement — online store",
					balance: "55861.37",
					debit: "2824.60",
				},
				{
					date: "2026-10-08",
					journalNo: "JV-2026-1183",
					description: "Card settlement — Maybank merchant",
					balance: "62158.52",
					debit: "6297.15",
				},
				{
					date: "2026-10-09",
					journalNo: "OR-2026-4415",
					description: "Receipt — Rumah Idaman Interior",
					balance: "84435.68",
					debit: "22277.16",
				},
				{
					date: "2026-10-12",
					journalNo: "JV-2026-1184",
					description: "Card settlement — Maybank merchant",
					balance: "90770.52",
					debit: "6334.84",
				},
				{
					date: "2026-10-12",
					journalNo: "JV-2026-1185",
					description: "Cash sale — showroom (DuitNow)",
					balance: "93219.88",
					debit: "2449.36",
				},
				{
					date: "2026-10-13",
					journalNo: "JV-2026-1186",
					description: "Card settlement — Maybank merchant",
					balance: "94987.50",
					debit: "1767.62",
				},
				{
					date: "2026-10-13",
					journalNo: "JV-2026-1187",
					description: "FPX settlement — online store",
					balance: "102944.88",
					debit: "7957.38",
				},
				{
					date: "2026-10-14",
					journalNo: "JV-2026-1188",
					description: "Card settlement — Maybank merchant",
					balance: "108768.68",
					debit: "5823.80",
				},
				{
					date: "2026-10-14",
					journalNo: "JV-2026-1189",
					description: "FPX settlement — online store",
					balance: "111259.39",
					debit: "2490.71",
				},
				{
					date: "2026-10-15",
					journalNo: "OR-2026-4416",
					description: "Receipt — Universiti Teknologi Lestari",
					balance: "135452.52",
					debit: "24193.13",
				},
				{
					date: "2026-10-15",
					journalNo: "OR-2026-4417",
					description: "Receipt — Nusantara Logistik Bhd",
					balance: "158594.69",
					debit: "23142.17",
				},
				{
					date: "2026-10-15",
					journalNo: "PV-2026-2265",
					description: "EPF, SOCSO, EIS and PCB — September",
					balance: "143976.49",
					credit: "14618.20",
				},
				{
					date: "2026-10-16",
					journalNo: "JV-2026-1190",
					description: "Card settlement — Maybank merchant",
					balance: "148820.88",
					debit: "4844.39",
				},
				{
					date: "2026-10-19",
					journalNo: "OR-2026-4418",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "167537.06",
					debit: "18716.18",
				},
				{
					date: "2026-10-19",
					journalNo: "OR-2026-4419",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "175064.02",
					debit: "7526.96",
				},
				{
					date: "2026-10-20",
					journalNo: "PV-2026-2266",
					description: "Payment — Pos Laju courier",
					balance: "158023.18",
					credit: "17040.84",
				},
				{
					date: "2026-10-20",
					journalNo: "PV-2026-2267",
					description: "Rental — factory and showroom, October",
					balance: "139523.18",
					credit: "18500.00",
				},
				{
					date: "2026-10-21",
					journalNo: "JV-2026-1191",
					description: "Card settlement — Maybank merchant",
					balance: "140479.17",
					debit: "955.99",
				},
				{
					date: "2026-10-21",
					journalNo: "OR-2026-4420",
					description: "Receipt — Butterworth Office Supplies",
					balance: "159987.93",
					debit: "19508.76",
				},
				{
					date: "2026-10-22",
					journalNo: "OR-2026-4421",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "172506.37",
					debit: "12518.44",
				},
				{
					date: "2026-10-22",
					journalNo: "JV-2026-1192",
					description: "Cash sale — showroom (DuitNow)",
					balance: "178664.66",
					debit: "6158.29",
				},
				{
					date: "2026-10-23",
					journalNo: "OR-2026-4422",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "196085.76",
					debit: "17421.10",
				},
				{
					date: "2026-10-23",
					journalNo: "JV-2026-1193",
					description: "FPX settlement — online store",
					balance: "200290.10",
					debit: "4204.34",
				},
				{
					date: "2026-10-26",
					journalNo: "JV-2026-1194",
					description: "FPX settlement — online store",
					balance: "206536.25",
					debit: "6246.15",
				},
				{
					date: "2026-10-26",
					journalNo: "PV-2026-2268",
					description: "Payment — Kilang Papan Sri Kedah",
					balance: "188943.15",
					credit: "17593.10",
				},
				{
					date: "2026-10-27",
					journalNo: "PV-2026-2269",
					description: "Payment — Hafele Malaysia Sdn Bhd",
					balance: "165688.21",
					credit: "23254.94",
				},
				{
					date: "2026-10-27",
					journalNo: "JV-2026-1195",
					description: "Cash sale — showroom (DuitNow)",
					balance: "170656.09",
					debit: "4967.88",
				},
				{
					date: "2026-10-28",
					journalNo: "PV-2026-2270",
					description: "Payment — Fabrik Tekstil Utama",
					balance: "145248.59",
					credit: "25407.50",
				},
				{
					date: "2026-10-28",
					journalNo: "PV-2026-2271",
					description: "SST-02 payment — Jul–Aug 2026",
					balance: "128268.39",
					credit: "16980.20",
				},
				{
					date: "2026-10-29",
					journalNo: "OR-2026-4423",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "148607.64",
					debit: "20339.25",
				},
				{
					date: "2026-10-29",
					journalNo: "PV-2026-2272",
					description: "Payment — Fabrik Tekstil Utama",
					balance: "129725.42",
					credit: "18882.22",
				},
				{
					date: "2026-10-30",
					journalNo: "OR-2026-4424",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "146614.33",
					debit: "16888.91",
				},
				{
					date: "2026-10-30",
					journalNo: "PV-2026-2273",
					description: "Payment — Kilang Papan Sri Kedah",
					balance: "135484.00",
					credit: "11130.33",
				},
				{
					date: "2026-10-30",
					journalNo: "JV-2026-1196",
					description: "Term loan instalment — Maybank Islamic",
					balance: "127504.00",
					credit: "7980.00",
				},
				{
					date: "2026-10-30",
					journalNo: "JV-2026-1197",
					description: "Bank charges — October",
					balance: "127091.65",
					credit: "412.35",
				},
			],
			totalDebit: "305668.66",
			totalCredit: "277437.61",
			closingBalance: "127091.65",
		},
		{
			code: "1100-001",
			name: "Trade receivables",
			openingBalance: "458937.36",
			lines: [
				{
					date: "2026-10-01",
					journalNo: "INV-2026-1181",
					description: "Invoice — Taman Desa Property Management",
					balance: "472370.13",
					debit: "13432.77",
				},
				{
					date: "2026-10-02",
					journalNo: "INV-2026-1182",
					description: "Invoice — Grand Borneo Resort Sdn Bhd",
					balance: "502884.19",
					debit: "30514.06",
				},
				{
					date: "2026-10-05",
					journalNo: "INV-2026-1183",
					description: "Invoice — IKEO Home Solutions Sdn Bhd",
					balance: "512726.23",
					debit: "9842.04",
				},
				{
					date: "2026-10-05",
					journalNo: "OR-2026-4411",
					description: "Receipt — Rumah Idaman Interior",
					balance: "505789.48",
					credit: "6936.75",
				},
				{
					date: "2026-10-06",
					journalNo: "INV-2026-1184",
					description: "Invoice — Grand Borneo Resort Sdn Bhd",
					balance: "545222.17",
					debit: "39432.69",
				},
				{
					date: "2026-10-06",
					journalNo: "OR-2026-4412",
					description: "Receipt — Rumah Idaman Interior",
					balance: "537934.46",
					credit: "7287.71",
				},
				{
					date: "2026-10-07",
					journalNo: "OR-2026-4413",
					description: "Receipt — Nusantara Logistik Bhd",
					balance: "512225.98",
					credit: "25708.48",
				},
				{
					date: "2026-10-07",
					journalNo: "OR-2026-4414",
					description: "Receipt — Klinik Pergigian Senyum",
					balance: "500141.15",
					credit: "12084.83",
				},
				{
					date: "2026-10-08",
					journalNo: "INV-2026-1185",
					description: "Invoice — Syarikat Kayu Jati Utara",
					balance: "507502.58",
					debit: "7361.43",
				},
				{
					date: "2026-10-09",
					journalNo: "INV-2026-1186",
					description: "Invoice — Taman Desa Property Management",
					balance: "516457.61",
					debit: "8955.03",
				},
				{
					date: "2026-10-09",
					journalNo: "OR-2026-4415",
					description: "Receipt — Rumah Idaman Interior",
					balance: "494180.45",
					credit: "22277.16",
				},
				{
					date: "2026-10-12",
					journalNo: "INV-2026-1187",
					description: "Invoice — Hotel Seri Pinang Sdn Bhd",
					balance: "500880.50",
					debit: "6700.05",
				},
				{
					date: "2026-10-13",
					journalNo: "INV-2026-1188",
					description: "Invoice — Universiti Teknologi Lestari",
					balance: "507491.18",
					debit: "6610.68",
				},
				{
					date: "2026-10-15",
					journalNo: "INV-2026-1189",
					description: "Invoice — Syarikat Kayu Jati Utara",
					balance: "523958.45",
					debit: "16467.27",
				},
				{
					date: "2026-10-15",
					journalNo: "OR-2026-4416",
					description: "Receipt — Universiti Teknologi Lestari",
					balance: "499765.32",
					credit: "24193.13",
				},
				{
					date: "2026-10-15",
					journalNo: "OR-2026-4417",
					description: "Receipt — Nusantara Logistik Bhd",
					balance: "476623.15",
					credit: "23142.17",
				},
				{
					date: "2026-10-16",
					journalNo: "INV-2026-1190",
					description: "Invoice — Syarikat Kayu Jati Utara",
					balance: "487215.43",
					debit: "10592.28",
				},
				{
					date: "2026-10-19",
					journalNo: "INV-2026-1191",
					description: "Invoice — Butterworth Office Supplies",
					balance: "500958.54",
					debit: "13743.11",
				},
				{
					date: "2026-10-19",
					journalNo: "OR-2026-4418",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "482242.36",
					credit: "18716.18",
				},
				{
					date: "2026-10-19",
					journalNo: "OR-2026-4419",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "474715.40",
					credit: "7526.96",
				},
				{
					date: "2026-10-21",
					journalNo: "INV-2026-1192",
					description: "Invoice — Penang Cohort Co-Working Sdn Bhd",
					balance: "492890.80",
					debit: "18175.40",
				},
				{
					date: "2026-10-21",
					journalNo: "OR-2026-4420",
					description: "Receipt — Butterworth Office Supplies",
					balance: "473382.04",
					credit: "19508.76",
				},
				{
					date: "2026-10-22",
					journalNo: "INV-2026-1193",
					description: "Invoice — Hotel Seri Pinang Sdn Bhd",
					balance: "486406.25",
					debit: "13024.21",
				},
				{
					date: "2026-10-22",
					journalNo: "OR-2026-4421",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "473887.81",
					credit: "12518.44",
				},
				{
					date: "2026-10-23",
					journalNo: "INV-2026-1194",
					description: "Invoice — IKEO Home Solutions Sdn Bhd",
					balance: "490592.34",
					debit: "16704.53",
				},
				{
					date: "2026-10-23",
					journalNo: "OR-2026-4422",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "473171.24",
					credit: "17421.10",
				},
				{
					date: "2026-10-26",
					journalNo: "INV-2026-1195",
					description: "Invoice — Grand Borneo Resort Sdn Bhd",
					balance: "486223.75",
					debit: "13052.51",
				},
				{
					date: "2026-10-27",
					journalNo: "INV-2026-1196",
					description: "Invoice — Taman Desa Property Management",
					balance: "503670.61",
					debit: "17446.86",
				},
				{
					date: "2026-10-29",
					journalNo: "CN-2026-0041",
					description: "Credit note — Rumah Idaman Interior (returns)",
					balance: "500490.61",
					credit: "3180.00",
				},
				{
					date: "2026-10-29",
					journalNo: "INV-2026-1197",
					description: "Invoice — Taman Desa Property Management",
					balance: "536336.85",
					debit: "35846.24",
				},
				{
					date: "2026-10-29",
					journalNo: "OR-2026-4423",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "515997.60",
					credit: "20339.25",
				},
				{
					date: "2026-10-30",
					journalNo: "INV-2026-1198",
					description: "Invoice — Syarikat Kayu Jati Utara",
					balance: "541069.16",
					debit: "25071.56",
				},
				{
					date: "2026-10-30",
					journalNo: "OR-2026-4424",
					description: "Receipt — Grand Borneo Resort Sdn Bhd",
					balance: "524180.25",
					credit: "16888.91",
				},
			],
			totalDebit: "302972.72",
			totalCredit: "237729.83",
			closingBalance: "524180.25",
		},
		{
			code: "6200-002",
			name: "Utilities (TNB, Air Selangor)",
			openingBalance: "37483.70",
			lines: [
				{
					date: "2026-10-06",
					journalNo: "PV-2026-4822",
					description: "TNB — factory, September bill",
					balance: "40604.10",
					debit: "3120.40",
				},
				{
					date: "2026-10-09",
					journalNo: "PV-2026-4828",
					description: "Air Selangor — September",
					balance: "40890.25",
					debit: "286.15",
				},
				{
					date: "2026-10-14",
					journalNo: "PV-2026-4830",
					description: "TM Unifi Business — October",
					balance: "41370.25",
					debit: "480.00",
				},
				{
					date: "2026-10-31",
					journalNo: "JV-2026-4868",
					description: "Accrual — TNB showroom, October",
					balance: "41870.25",
					debit: "500.00",
				},
			],
			totalDebit: "4386.55",
			totalCredit: "0.00",
			closingBalance: "41870.25",
		},
	],
};

export default function GeneralLedgerReportDemo() {
	return <Shell render={() => <GeneralLedgerReport report={DATA} />} />;
}
```

## Use

Ledger listings for audit, account reviews, bank and receivables reconciliations; runs over many pages.

## Props

report: GeneralLedgerData — period, accounts [{code, name, openingBalance, lines [{date, journalNo, description, debit?, credit?, balance}], totalDebit, totalCredit, closingBalance}], balanceStyle? ('drcr' | 'brackets'), basis?, currency?, filters?, preparedBy?, preparedOn?, notes?; plus brand?, size? (default 'a4-landscape'), stamp?, fit?, isolate?, className.

- `report`: `GeneralLedgerData`
- `size?`: `"a4" | "a4-landscape" | "a5" | "letter" | "receipt"`. Default `"a4-landscape"`.
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- Also accepts `ComponentProps<"article">`.

## Notes

Assembled on the kit's DocumentTable (sections per account, dense) so the column header repeats on every printed page; account headers don't orphan and the closing row doesn't start a page. Balances are debit-positive decimal strings printed with a Dr/Cr suffix (Dt/Kt in BM). Running balances come from the ledger — never recomputed.

Category: Documents. Source: `packages/ui/src/documents/reports.tsx:991-1082`.
