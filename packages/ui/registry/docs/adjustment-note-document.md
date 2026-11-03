# AdjustmentNoteDocument

Credit note or debit note (kind) against an original invoice, with reason, lines, totals and the MyInvois e-invoice block.

```tsx
import { AdjustmentNoteDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { AdjustmentNoteDocument, DocumentBrandProvider } from "@cynco-labs/ui";

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

const QRSLOT = (t) => (
	<div className="flex size-full items-center justify-center rounded-[1.5mm] border border-dashed border-[var(--doc-subtle)] text-center text-[6pt] leading-tight text-[var(--doc-subtle)]">
		{t}
	</div>
);

const ORIG = { number: "INV-2026-0142", date: "2026-10-28", amount: "52013.80" };

const CN = {
	kind: "credit",
	number: "CN-2026-0018",
	status: "issued",
	date: "2026-11-03",
	customer: NUSA,
	originalInvoice: ORIG,
	reason: {
		category: "Goods returned and service adjustment",
		text: "40 m of unused AC cable returned on 30 Oct 2026 (GRN-2026-0211); first-year maintenance prorated after the customer moved the service start to January 2027.",
	},
	lines: [
		{
			description: "AC cable 6mm² 4-core XLPE/SWA — returned",
			detail: "Unused, original drum",
			quantity: "40",
			unit: "m",
			unitPrice: "8.50",
			discount: "10%",
			taxCode: "ST10",
			taxRate: "10",
			amount: "306.00",
		},
		{
			description: "Preventive maintenance — prorated",
			detail: "2 of 12 months, Nov–Dec 2026",
			quantity: "1",
			unit: "lot",
			unitPrice: "300.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "300.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "606.00" },
		{ label: "serviceTax", hint: "8%", value: "24.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "30.60", kind: "tax" },
		{ label: "total", value: "660.60", kind: "total" },
		{ label: "appliedTo", hint: "INV-2026-0142", value: "660.60" },
	],
	einvoice: {
		status: "validated",
		uuid: "7HXN3Q0RK2WJ5M8C1TDBV9FEPA",
		validatedAt: "3 Nov 2026, 10:47 am",
		url: "https://myinvois.hasil.gov.my/",
		qr: QRSLOT("MyInvois QR (from LHDN)"),
	},
	notes: "The credit has been applied to INV-2026-0142. The new balance due is RM 36,353.20.",
	signature: true,
};

const DN = {
	kind: "debit",
	number: "DN-2026-0007",
	status: "issued",
	date: "2026-11-04",
	customer: NUSA,
	originalInvoice: ORIG,
	reason: {
		category: "Additional charges",
		text: "Additional cable run and trunking requested on site by the customer on 22 Oct 2026 (variation order VO-03).",
	},
	lines: [
		{
			description: "AC cable 6mm² 4-core XLPE/SWA — additional run",
			quantity: "30",
			unit: "m",
			unitPrice: "8.50",
			taxCode: "ST10",
			taxRate: "10",
			amount: "255.00",
		},
		{
			description: "GI trunking 100 × 50 mm, supply and install",
			detail: "Loading bay to main switch room",
			quantity: "1",
			unit: "lot",
			unitPrice: "450.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "450.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "705.00" },
		{ label: "serviceTax", hint: "8%", value: "36.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "25.50", kind: "tax" },
		{ label: "totalDue", value: "766.50", kind: "total" },
	],
	einvoice: { status: "pending", uuid: "Q2B7VNX4K9HJ1D8RTW3M0CFE6S" },
	signature: true,
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
	kind: {
		label: "Note",
		options: [
			{ value: "credit", label: "Credit note" },
			{ value: "debit", label: "Debit note" },
		],
		default: "credit",
	},
};

export default function AdjustmentNoteDocumentDemo({
	layout = "minimal",
	locale = "en",
	kind = "credit",
}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<AdjustmentNoteDocument note={kind === "credit" ? CN : DN} />
		</DocumentBrandProvider>
	);
}
```

## Use

Returns, price adjustments and additional charges after an invoice has been issued; both note types are e-invoices in their own right under MyInvois.

## Props

note: AdjustmentNoteData { kind ('credit'|'debit'), number, status, date, currency?, customer, originalInvoice {number, date, amount}, reason {category?, text}, reference?, lines, totals, amountInWords?, exchange?, einvoice?, notes?, signature? } + presentation props.

- `note`: `AdjustmentNoteData`
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

Layouts minimal / classic / modern in black ink only, any font, locales en / ms / en-ms (bilingual labels stacked or slashed). Money is printed exactly as given (decimal strings); nothing is recomputed. Print: named @page with page numbers, table headers repeat, rows and the totals/sign-off blocks avoid splitting; isolate (default true) prints only the sheet. The original invoice (number, date, amount) sits in the meta band; the reason is a DocCallout beside the customer. Settlement rows (e.g. label 'appliedTo' with the invoice number as hint) follow the total.

Category: Documents. Source: `packages/ui/src/documents/sales.tsx`.
