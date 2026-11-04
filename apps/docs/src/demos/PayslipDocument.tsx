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
