# QuotationDocument

Quotation with grouped line sections and subtotals, optional add-on items, totals, terms & conditions and a customer acceptance block beside the issuer's signature.

```tsx
import { QuotationDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	type DocBrand,
	type DocLayout,
	type DocLocale,
	DocumentBrandProvider,
	type QuotationData,
	QuotationDocument,
} from "@cynco-labs/ui";

const BRAND: DocBrand = {
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
	address: ["Lot 12A, Jalan Sungai Puloh, Kawasan Perindustrian Sungai Puloh", "42100 Klang, Selangor"],
	attention: "En. Hafiz Zainal, Facilities",
	phone: "+60 12-334 8821",
};

const QUO: QuotationData = {
	number: "QUO-2026-0093",
	status: "sent",
	date: "2026-10-20",
	validUntil: "2026-11-19",
	reference: "RFQ-NL-2604",
	terms: "50% deposit",
	preparedBy: "Lim Wei Jie",
	customer: NUSA,
	shipTo: NUSA_SITE,
	sections: [
		{
			title: "Phase 1 · Survey & design",
			subtotal: "3700.00",
			lines: [
				{
					description: "Site survey and shading analysis",
					detail: "Drone roof survey, structural check, 12-month yield simulation",
					quantity: "1",
					unit: "lot",
					unitPrice: "1200.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "1200.00",
				},
				{
					description: "System design and NEM 3.0 application",
					detail: "Single-line diagram, SEDA and TNB submissions",
					quantity: "1",
					unit: "lot",
					unitPrice: "2500.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "2500.00",
				},
			],
		},
		{
			title: "Phase 2 · Supply",
			subtotal: "22640.00",
			lines: [
				{
					description: "Jinko Tiger Neo 580W N-type mono panel",
					detail: "25-year linear performance warranty",
					quantity: "22",
					unit: "pcs",
					unitPrice: "720.00",
					taxCode: "ST10",
					taxRate: "10",
					amount: "15840.00",
				},
				{
					description: "Huawei SUN2000-12KTL-M5 string inverter",
					quantity: "1",
					unit: "unit",
					unitPrice: "6800.00",
					taxCode: "ST10",
					taxRate: "10",
					amount: "6800.00",
				},
			],
		},
		{
			title: "Phase 3 · Installation",
			subtotal: "9800.00",
			lines: [
				{
					description: "Mounting, cabling, earthing and commissioning",
					detail: "Includes scaffolding, PPE and CIDB-registered crew",
					quantity: "1",
					unit: "lot",
					unitPrice: "9800.00",
					taxCode: "SV8",
					taxRate: "8",
					amount: "9800.00",
				},
			],
		},
	],
	optionalItems: [
		{
			description: "Huawei LUNA2000 10 kWh battery storage",
			quantity: "1",
			unit: "unit",
			unitPrice: "18500.00",
			taxCode: "ST10",
			taxRate: "10",
			amount: "18500.00",
		},
		{
			description: "Bird-proofing mesh around array",
			quantity: "1",
			unit: "lot",
			unitPrice: "1450.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "1450.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "36140.00" },
		{ label: "serviceTax", hint: "8%", value: "1080.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "2264.00", kind: "tax" },
		{ label: "total", value: "39484.00", kind: "total" },
	],
	notes: "Estimated generation 15,900 kWh/yr. Estimated payback 4.6 years at current TNB tariff.",
	termsAndConditions: [
		"Prices are valid until the date stated above.",
		"50% deposit on acceptance; balance within 14 days of commissioning.",
		"Installation within 21 working days of deposit, subject to SEDA approval.",
		"Workmanship warranty of 5 years from the date of commissioning.",
		"Any work outside this scope is quoted separately.",
		"Prices include SST at the prevailing rates.",
	],
};

export const controls = {
	layout: {
		label: "Layout",
		options: [
			{ value: "minimal", label: "Minimal" },
			{ value: "classic", label: "Classic" },
			{ value: "modern", label: "Modern" },
		],
		default: "minimal",
	},
	locale: {
		label: "Language",
		options: [
			{ value: "en", label: "EN" },
			{ value: "ms", label: "BM" },
			{ value: "en-ms", label: "EN + BM" },
		],
		default: "en",
	},
};

export default function QuotationDocumentDemo({
	layout = "minimal",
	locale = "en",
}: {
	layout?: DocLayout;
	locale?: DocLocale;
} = {}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<QuotationDocument quotation={QUO} />
		</DocumentBrandProvider>
	);
}
```

## Use

Sending a priced proposal for the customer to sign and return (projects in phases, supply + installation jobs).

## Props

quotation: QuotationData { number, status, date, validUntil, reference?, terms?, currency?, preparedBy?, customer, shipTo?, lines? | sections? [{title, lines, subtotal}], optionalItems?, totals, amountInWords?, notes?, termsAndConditions (string | string[]), acceptance? (false | {statement, name, date}), signature? } + presentation props.

- `quotation`: `QuotationData`
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `defaultFit?`: `"width" | "none"`. Uncontrolled starting fit. Default "width".
- `onFitChange?`: `(fit: DocumentFit) => void`
- `zoomControl?`: `boolean`. Show "Fit width / Actual size" above the sheet while it is scaled down. Default true. Fit-to-width cancels browser zoom, so readers need a way back to 100% to enlarge the text (WCAG 1.4.4). Hidden in print, and when `fit` is controlled without `onFitChange`.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue" | null`. Overrides the stamp derived from the document status. `null` hides it.
- `size?`: `"a4" | "letter"`. Default `"a4"`.
- Also accepts `ComponentProps<"article">`.

## Notes

Layouts minimal / classic / modern in black ink only, any font, locales en / ms / en-ms (bilingual labels stacked or slashed). Money is printed exactly as given (decimal strings); nothing is recomputed. Print: named @page with page numbers, table headers repeat, rows and the totals/sign-off blocks avoid splitting; isolate (default true) prints only the sheet. Section subtotals print as given; optional items are listed in their own group marked 'Not included in the total'. A list of T&Cs prints numbered in two columns. Both sign-off columns use AcceptanceBlock so their lines align; the customer side has a company-stamp box.

Category: Documents. Source: `packages/ui/src/documents/sales.tsx:584-599`.
