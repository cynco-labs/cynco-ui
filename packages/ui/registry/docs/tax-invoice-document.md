# TaxInvoiceDocument

Malaysian tax invoice — or plain Invoice for a seller not registered for SST — assembled from the document kit.

```tsx
import { TaxInvoiceDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { DocumentBrandProvider, TaxInvoiceDocument } from "@cynco-labs/ui";

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

const SST_INV = {
	title: "taxInvoice",
	number: "INV-2026-0142",
	status: "partially_paid",
	invoiceDate: "2026-10-28",
	dueDate: "2026-11-27",
	terms: "Net 30",
	reference: "PO-NL-7781",
	billTo: NUSA,
	shipTo: NUSA_SITE,
	lines: [
		{
			description: "Rooftop solar PV installation — 12.3 kWp",
			detail: "Mounting, DC/AC cabling, earthing and commissioning · Warehouse B",
			quantity: "1",
			unit: "lot",
			unitPrice: "38500.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "38500.00",
		},
		{
			description: "Huawei SUN2000-12KTL-M5 string inverter",
			detail: "S/N HV2310045872 · 10-year manufacturer warranty",
			quantity: "1",
			unit: "unit",
			unitPrice: "6800.00",
			taxCode: "ST10",
			taxRate: "10",
			amount: "6800.00",
		},
		{
			description: "AC cable 6mm² 4-core XLPE/SWA",
			quantity: "120",
			unit: "m",
			unitPrice: "8.50",
			discount: "10%",
			taxCode: "ST10",
			taxRate: "10",
			amount: "918.00",
		},
		{
			description: "Preventive maintenance — first year",
			detail: "2 site visits, panel cleaning, thermal scan and performance report",
			quantity: "1",
			unit: "yr",
			unitPrice: "1800.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "1800.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "48018.00" },
		{ label: "serviceTax", hint: "8%", value: "3224.00", kind: "tax" },
		{ label: "salesTax", hint: "10%", value: "771.80", kind: "tax" },
		{ label: "total", value: "52013.80", kind: "total" },
		{ label: "deposit", hint: "paid 14 Oct 2026", value: "-15000.00", kind: "paid" },
		{ label: "balanceDue", value: "37013.80", kind: "balance" },
	],
	payment: {
		bankName: "Maybank Islamic",
		accountName: "Arus Teknik Sdn Bhd",
		accountNumber: "5621 4400 8812",
		note: "Please quote the invoice number as the payment reference.",
	},
	einvoice: { status: "pending", uuid: "F9D425P6DS7D8IU0K2C8VXHF10" },
	notes:
		"Installation completed and commissioned on 24 Oct 2026. Net Energy Metering (NEM 3.0) application ref. SEDA-NEM-2026-08812.",
	termsAndConditions:
		"Late payment interest of 1.5% per month applies after the due date. Goods remain the property of Arus Teknik Sdn Bhd until paid in full.",
	signature: true,
};

const USD_INV = {
	title: "taxInvoice",
	number: "INV-2026-0147",
	status: "issued",
	invoiceDate: "2026-10-31",
	dueDate: "2026-11-30",
	terms: "Net 30",
	reference: "PRE-PO-20931",
	currency: "USD",
	billTo: {
		name: "Pacific Rim Energy Pte Ltd",
		registrationNo: "UEN 201734521K",
		tin: "EI00000000020",
		address: ["80 Robinson Road, #17-02", "Singapore 068898"],
		attention: "Mr. Daniel Tan, Accounts Payable",
	},
	lines: [
		{
			description: "Solar fleet monitoring — platform setup",
			detail: "Onboarding of 14 sites, SCADA integration and dashboards",
			quantity: "1",
			unit: "lot",
			unitPrice: "2400.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "2400.00",
		},
		{
			description: "Engineering consultancy",
			detail: "Yield assessment and inverter sizing review, October 2026",
			quantity: "16",
			unit: "hr",
			unitPrice: "150.00",
			taxCode: "SV8",
			taxRate: "8",
			amount: "2400.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "4800.00" },
		{ label: "serviceTax", hint: "8%", value: "384.00", kind: "tax" },
		{ label: "totalDue", value: "5184.00", kind: "total" },
	],
	exchange: {
		rate: "4.4350",
		rateDate: "2026-10-31",
		source: "Bank Negara Malaysia (selling)",
		taxMyr: "1703.04",
		totalMyr: "22991.04",
	},
	payment: {
		bankName: "Maybank Islamic",
		accountName: "Arus Teknik Sdn Bhd",
		accountNumber: "5621 4400 9907 (USD)",
		swiftCode: "MBISMYKL",
	},
	einvoice: {
		status: "validated",
		uuid: "4K7Q2M9XWJ3HR8T0BNC5D1EVAZ",
		validatedAt: "31 Oct 2026, 4:12 pm",
		url: "https://myinvois.hasil.gov.my/",
		qr: (
			<div className="flex size-full items-center justify-center rounded-[1.5mm] border border-dashed border-[var(--doc-subtle)] text-center text-[6pt] leading-tight text-[var(--doc-subtle)]">
				MyInvois QR (from LHDN)
			</div>
		),
	},
	notes: "Bank charges are borne by the payer.",
};

const PLAIN_INV = {
	title: "invoice",
	number: "INV-2026-0019",
	status: "overdue",
	invoiceDate: "2026-09-12",
	dueDate: "2026-10-12",
	terms: "Net 30",
	billTo: {
		name: "Restoran Selera Kampung",
		registrationNo: "202003145566 (SA0523311-T)",
		address: ["No. 7, Jalan SS 15/4B", "47500 Subang Jaya, Selangor"],
		attention: "Cik Nurul Huda",
	},
	lines: [
		{
			description: "Kitchen exhaust fan replacement",
			detail: 'Supply and install 18" industrial exhaust fan',
			quantity: "2",
			unit: "unit",
			unitPrice: "1150.00",
			amount: "2300.00",
		},
		{
			description: "Electrical wiring — kitchen extension",
			quantity: "1",
			unit: "lot",
			unitPrice: "1680.00",
			amount: "1680.00",
		},
		{
			description: "Labour — emergency call-out (Sunday)",
			quantity: "3",
			unit: "hr",
			unitPrice: "95.00",
			amount: "285.00",
		},
	],
	totals: [
		{ label: "subtotal", value: "4265.00" },
		{ label: "discount", hint: "loyal customer", value: "-65.00", kind: "discount" },
		{ label: "total", value: "4200.00", kind: "total" },
	],
	payment: {
		bankName: "CIMB Bank",
		accountName: "Arus Servis Enterprise",
		accountNumber: "8008 1127 6634",
	},
	notes: "This invoice is now overdue. Kindly arrange payment at your earliest convenience.",
};

const PLAIN_BRAND = {
	company: {
		name: "Arus Servis Enterprise",
		registrationNo: "202103118842 (003305127-P)",
		tin: "IG24118870050",
		address: ["No. 3, Jalan Kenari 5, Bandar Puchong Jaya", "47100 Puchong, Selangor"],
		phone: "+60 12-668 2210",
		email: "arusservis@gmail.com",
	},
	footerNote: "Terima kasih atas sokongan anda.",
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
	variant: {
		label: "Invoice",
		options: [
			{ value: "sst", label: "SST · MYR" },
			{ value: "usd", label: "USD" },
			{ value: "plain", label: "Non-SST" },
		],
		default: "sst",
	},
};

export default function TaxInvoiceDocumentDemo({
	layout = "minimal",
	locale = "en",
	variant = "sst",
}) {
	const invoice = variant === "usd" ? USD_INV : variant === "plain" ? PLAIN_INV : SST_INV;
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<TaxInvoiceDocument invoice={invoice} brand={variant === "plain" ? PLAIN_BRAND : undefined} />
		</DocumentBrandProvider>
	);
}
```

## Use

Printing / PDF-ing a posted sales invoice, including foreign-currency invoices that must show tax and total in MYR for LHDN.

## Props

invoice: TaxInvoiceData { title ('taxInvoice'|'invoice'), number, status, subtitle?, invoiceDate, dueDate?, terms?, reference?, currency?, billTo, shipTo?, lines: SalesDocLine[] (description, detail, code, quantity, unit, unitPrice, discount, taxCode, taxRate, amount), totals: TotalsRow[], amountInWords?, exchange? {rate, rateDate, source, taxMyr, totalMyr}, payment? {bank…, qr}, einvoice? {status, uuid, validatedAt, url, qr}, notes?, termsAndConditions?, signature? } + brand?, size ('a4'|'letter'), stamp?, fit?, isolate?, className.

- `invoice`: `TaxInvoiceData`
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

Layouts minimal / classic / modern in black ink only, any font, locales en / ms / en-ms (bilingual labels stacked or slashed). Money is printed exactly as given (decimal strings); nothing is recomputed. Print: named @page with page numbers, table headers repeat, rows and the totals/sign-off blocks avoid splitting; isolate (default true) prints only the sheet. Stamp from status (paid/void/overdue/draft; override with stamp, null hides). Discount and tax columns appear only when a line uses them; tax shows rate with the SST code under it. Totals rows may use label keys subtotal, discount, serviceTax, salesTax, sst, rounding, total, totalDue, deposit, amountPaid, balanceDue. Foreign currency: the exchange rate and MYR equivalents are printed in a ForeignCurrencyNote under the totals. Production must pass the posted totals, the MyInvois QR element once validated, and the DuitNow QR element if used. The computer-generated notice is hidden when a signature is printed.

Category: Documents. Source: `packages/ui/src/documents/sales.tsx`.
