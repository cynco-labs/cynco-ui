# PayslipDocument

A Malaysian payslip: employer (EPF / SOCSO / LHDN employer numbers) and employee particulars (staff ID, IC, position, department, EPF, SOCSO and income tax numbers, bank account), pay period and pay date, Earnings and Deductions side by side, gross / total deductions / net pay with net pay in words, employer EPF / SOCSO / EIS / HRD Corp contributions as a quieter strip, year-to-date figures and a confidentiality note.

```tsx
import { PayslipDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { type DocLayout, type DocLocale, DocumentBrandProvider, PayslipDocument } from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Lumen Digital Studio Sdn Bhd",
		registrationNo: "201801029384 (1290187-D)",
		tin: "C25103948270",
		address: ["Unit 12-3, The Vertical Corporate Tower B, Bangsar South", "59200 Kuala Lumpur"],
		phone: "+60 3-2242 0198",
		email: "hr@lumendigital.my",
	},
};

const PS = {
	number: "PS-2026-10-0042",
	periodFrom: "2026-10-01",
	periodTo: "2026-10-31",
	payDate: "2026-10-31",
	employer: { epfNo: "021456789", socsoNo: "B32012345678", taxNo: "E 9123456708" },
	employee: {
		name: "Nurul Aina binti Kamarudin",
		staffId: "LDS-0042",
		icNo: "920814-14-5528",
		position: "Senior UX Designer",
		department: "Product Design",
		epfNo: "19837465",
		socsoNo: "920814145528",
		taxNo: "IG 21837465090",
		bankName: "Maybank",
		bankAccount: "1621 4589 3307",
	},
	earnings: [
		{ label: "basicSalary", amount: "4200.00" },
		{ label: { en: "Transport allowance", ms: "Elaun pengangkutan" }, amount: "250.00" },
		{ label: { en: "Phone allowance", ms: "Elaun telefon" }, amount: "100.00" },
		{
			label: "overtime",
			detail: { en: "10.0 hrs × RM 30.29 (1.5×)", ms: "10.0 jam × RM 30.29 (1.5×)" },
			amount: "302.90",
		},
		{
			label: "commission",
			detail: { en: "Q3 retainer upsell", ms: "Jualan tambahan retainer S3" },
			amount: "380.00",
		},
	],
	deductions: [
		{
			label: "epf",
			detail: { en: "11% of EPF wages RM 4,930.00", ms: "11% daripada gaji KWSP RM 4,930.00" },
			amount: "544.00",
		},
		{
			label: "socso",
			detail: { en: "Employment Injury & Invalidity", ms: "Bencana Pekerjaan & Keilatan" },
			amount: "26.25",
		},
		{ label: "eis", detail: "0.2%", amount: "10.50" },
		{ label: "pcb", amount: "213.45" },
		{ label: "zakat", detail: "Lembaga Zakat Selangor", amount: "50.00" },
		{
			label: "advance",
			detail: { en: "Recovery 2 of 3", ms: "Bayaran balik 2 daripada 3" },
			amount: "200.00",
		},
	],
	employerContributions: [
		{ label: "epf", amount: "643.00" },
		{ label: "socso", amount: "91.85" },
		{ label: "eis", amount: "10.50" },
		{ label: "hrdf", amount: "45.50" },
	],
	grossPay: "5232.90",
	totalDeductions: "1044.20",
	netPay: "4188.70",
	totalEmployerContributions: "790.85",
	ytd: [
		{ label: "grossPay", amount: "51904.62" },
		{ label: "epf", amount: "5412.00" },
		{ label: "socso", amount: "262.50" },
		{ label: "eis", amount: "105.00" },
		{ label: "pcb", amount: "2121.30" },
		{ label: "zakat", amount: "500.00" },
		{ label: "netPay", amount: "43303.82" },
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
	size: {
		label: "Size",
		options: [
			{ value: "a4", label: "A4" },
			{ value: "a5", label: "A5" },
		],
		default: "a4",
	},
};

export default function PayslipDocumentDemo({
	layout = "minimal",
	locale = "en",
	size = "a4",
}: {
	layout?: DocLayout;
	locale?: DocLocale;
	size?: "a4" | "a5";
}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<PayslipDocument payslip={PS} size={size} />
		</DocumentBrandProvider>
	);
}
```

## Use

Monthly payslips from a pay run, printed, emailed as PDF or shown in the employee portal; A5 for the half-sheet many SMEs print.

## Props

payslip: PayslipData { number?, periodFrom, periodTo, payDate, currency?, employer? {epfNo?, socsoNo?, taxNo?}, employee: {name, staffId?, icNo?, position?, department?, epfNo?, socsoNo?, taxNo?, bankName?, bankAccount?}, earnings, deductions, employerContributions?: {label, detail?, amount}[], grossPay, totalDeductions, netPay, totalEmployerContributions?, ytd?: {label, amount}[], note? }; plus brand?, size? (a4 | a5), stamp?, fit?, isolate?, className.

- `payslip`: `PayslipDocumentData`
- `stamp?`: `"copy" | "paid" | "void" | "draft" | "overdue"`. A diagonal stamp across the page: Paid, Void, Draft, Copy, Overdue.
- `brand?`: `Partial<DocBrand>`. Overrides the provider's brand (merged over it).
- `fit?`: `"width" | "none"`. On screen: scale the sheet down to fit its container ("width") or keep 100% and scroll ("none"). Controlled; pair with `onFitChange`. Leave unset to let the zoom control switch it.
- `defaultFit?`: `"width" | "none"`. Uncontrolled starting fit. Default "width".
- `onFitChange?`: `(fit: DocumentFit) => void`
- `zoomControl?`: `boolean`. Show "Fit width / Actual size" above the sheet while it is scaled down. Default true. Fit-to-width cancels browser zoom, so readers need a way back to 100% to enlarge the text (WCAG 1.4.4). Hidden in print, and when `fit` is controlled without `onFitChange`.
- `isolate?`: `boolean`. When printing, hide the rest of the app and print only this page. Default true.
- `size?`: `"a4" | "a5"`. Default `"a4"`.
- Also accepts `ComponentProps<"article">`.

## Notes

Line labels take keys that translate (basicSalary, allowance, overtime, commission, bonus, epf → KWSP, socso → PERKESO, eis → SIP, pcb, zakat, advance, hrdf → HRD Corp levy), {en, ms} or text; the optional detail line carries the basis (e.g. '11% of EPF wages RM 4,930.00'). All statutory amounts come from the payroll engine and are printed as given (EPF 11% employee / 13% or 12% employer, SOCSO, EIS 0.2%, PCB, zakat, HRDF). A4: meta strip, employee and employer side by side, then a gross, deductions and net strip. A5: one half-sheet: pay period and date move into the letterhead, employer numbers share the Employee row, basis lines are hidden and net pay is a single total with words beside it. Bilingual stacks line labels (English, Malay beneath); basis lines stay in English.

Category: Documents. Source: `packages/ui/src/documents/operations.tsx:1051-1068`.
