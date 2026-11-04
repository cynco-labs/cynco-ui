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
