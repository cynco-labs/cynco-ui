# ReceiptDocument

Official receipt in A4, A5 or 80mm thermal size: received from, payment method, amount received, allocation to invoices, amount in words and received-by signature.

```tsx
import { ReceiptDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { DocumentBrandProvider, GroupedTabButton, ReceiptDocument } from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Arus Teknik Sdn Bhd",
		registrationNo: "201801034567 (1295521-D)",
		sstNo: "B16-1809-32000417",
		tin: "C25718364020",
		address: ["No. 18, Jalan Pelabur 23/1, Seksyen 23", "40300 Shah Alam, Selangor"],
		phone: "+60 3-5541 2280",
		email: "accounts@arusteknik.my",
		website: "arusteknik.my",
	},
	layout: "minimal",
	locale: "en",
	signature: { name: "Lim Wei Jie", title: "Operations Manager" },
	footerNote: "Thank you for choosing Arus Teknik — powering Malaysian rooftops since 2018.",
};

const NUSA = {
	name: "Nusantara Logistik Bhd",
	registrationNo: "200501012345 (689012-W)",
	tin: "C10987654320",
	sstNo: "W10-1808-31004422",
	address: ["Lot 8, Persiaran Klang, Kawasan Perindustrian Bukit Raja", "41050 Klang, Selangor"],
	attention: "Puan Aisyah Rahman, Finance",
};

const NUSA_SITE = {
	name: "Nusantara Logistik Bhd — Warehouse B",
	address: [
		"Lot 12A, Jalan Sungai Puloh, Kawasan Perindustrian Sungai Puloh",
		"42100 Klang, Selangor",
	],
	attention: "En. Hafiz Zainal, Facilities",
	phone: "+60 12-334 8821",
};

function Ctl(groups) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{groups.map((g, i) => (
				<div key={i} className="flex-auto" style={{ minWidth: g[2].length * 64 }}>
					<GroupedTabButton value={g[0]} onValueChange={g[1]} options={g[2]} />
				</div>
			))}
		</div>
	);
}

const LAYOUTS = [
	{ value: "minimal", label: "Minimal" },
	{ value: "classic", label: "Classic" },
	{ value: "modern", label: "Modern" },
];

const LANGS = [
	{ value: "en", label: "EN" },
	{ value: "ms", label: "BM" },
	{ value: "en-ms", label: "EN + BM" },
];

function Shell(p) {
	return (
		<div className="flex flex-col gap-3">
			{Ctl(p.groups)}
			<DocumentBrandProvider
				brand={Object.assign({}, BRAND, { layout: p.layout, locale: p.locale })}
			>
				<div className={p.center ? "flex justify-center" : ""}>{p.children}</div>
			</DocumentBrandProvider>
		</div>
	);
}

const CHEQUE = {
	number: "OR-2026-0311",
	status: "issued",
	date: "2026-10-30",
	receivedFrom: {
		name: "Restoran Selera Kampung Sdn Bhd",
		registrationNo: "202003145566 (1361184-T)",
		tin: "C27713498010",
		address: ["No. 7, Jalan SS 15/4B", "47500 Subang Jaya, Selangor"],
	},
	payment: { method: "cheque", chequeNo: "004512", bank: "Public Bank Berhad" },
	amountReceived: "12000.00",
	allocations: [
		{ number: "INV-2026-0128", date: "2026-09-12", invoiceAmount: "8640.00", applied: "8640.00" },
		{ number: "INV-2026-0135", date: "2026-10-03", invoiceAmount: "5400.00", applied: "3360.00" },
	],
	notes: "Payment by cheque is subject to clearance. INV-2026-0135 has a balance of RM 2,040.00.",
};

const CASH = {
	number: "OR-2026-0318",
	status: "issued",
	date: "2026-11-01",
	receivedFrom: {
		name: "Ahmad Faizal bin Rahman",
		address: ["No. 22, Jalan Anggerik 3, Taman Sri Muda", "40400 Shah Alam, Selangor"],
	},
	payment: { method: "cash" },
	amountReceived: "1284.40",
	allocations: [
		{ number: "INV-2026-0151", date: "2026-10-29", invoiceAmount: "1284.42", applied: "1284.42" },
	],
	totals: [
		{ label: "totalDue", value: "1284.42" },
		{ label: "rounding", value: "-0.02", kind: "rounding" },
		{ label: "amountReceived", value: "1284.40", kind: "total" },
		{ label: "cashTendered", value: "1300.00" },
		{ label: "change", value: "15.60" },
	],
	notes: "Rounded to the nearest 5 sen (BNM rounding mechanism).",
};

export default function ReceiptDocumentDemo() {
	const [l, setL] = useState("minimal"),
		[g, setG] = useState("en"),
		[z, setZ] = useState("a4"),
		[m, setM] = useState("cheque");
	const r = m === "cash" ? CASH : CHEQUE;
	return (
		<Shell
			layout={l}
			locale={g}
			center={z !== "a4"}
			groups={[
				[l, setL, LAYOUTS],
				[g, setG, LANGS],
				[
					z,
					setZ,
					[
						{ value: "a4", label: "A4" },
						{ value: "a5", label: "A5" },
						{ value: "receipt", label: "80mm" },
					],
				],
				[
					m,
					setM,
					[
						{ value: "cheque", label: "Cheque" },
						{ value: "cash", label: "Cash" },
					],
				],
			]}
		>
			<div className={z === "a4" ? "w-full" : "w-auto"}>
				<ReceiptDocument receipt={r} size={z} fit={z === "a4" ? "width" : "width"} />
			</div>
		</Shell>
	);
}
```

## Use

Acknowledging a customer payment — cash at the counter (thermal, with 5-sen rounding), or cheque / transfer / DuitNow / card / FPX on A4 or A5.

## Props

receipt: ReceiptData { number, status, date, currency?, receivedFrom, payment {method: cash|cheque|bank_transfer|duitnow|card|fpx, chequeNo?, bank?, reference?, card?}, amountReceived, allocations? [{number, date, invoiceAmount?, applied}], totals? (e.g. totalDue, rounding, amountReceived, cashTendered, change), notes?, receivedBy? } + size ('a4'|'a5'|'receipt'), monochrome?, brand?, stamp?, fit?, isolate?, className.

## Notes

Layouts minimal / classic / modern in black ink only, any font, locales en / ms / en-ms (bilingual labels stacked or slashed). Money is printed exactly as given (decimal strings); nothing is recomputed. Print: named @page with page numbers, table headers repeat, rows and the totals/sign-off blocks avoid splitting; isolate (default true) prints only the sheet. A4/A5: amount-received headline, payment strip, 'the sum of' in words, allocation table, optional totals, received-by signature. 80mm: centred letterhead, single column of label/value rows, dashed separators, compact totals and words, no signature; monochrome by default because thermal printers print one ink. Cash rounding is a totals row passed by the caller (BNM 5-sen rounding).

Category: Documents. Source: `packages/ui/src/documents/sales.tsx`.
