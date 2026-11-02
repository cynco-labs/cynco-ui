import { DocumentBrandProvider, PurchaseOrderDocument } from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Kilang Roti Mutiara Sdn Bhd",
		registrationNo: "201601034217 (1204587-H)",
		sstNo: "B16-1809-32001472",
		tin: "C21458796300",
		address: ["Lot 22, Jalan Utas 15/7, Seksyen 15", "40200 Shah Alam, Selangor"],
		phone: "+60 3-5510 4421",
		email: "purchasing@rotimutiara.my",
	},
};

const PO = {
	number: "PO-2026-0088",
	date: "2026-10-30",
	requiredBy: "2026-11-06",
	terms: "Net 30",
	quotationRef: "QT-BBU-26-0412",
	requester: { name: "Nurul Huda Ismail", department: "Production" },
	vendor: {
		name: "Bekalan Bakeri Utama Sdn Bhd",
		registrationNo: "200901027781 (865412-P)",
		sstNo: "B10-1808-31004418",
		tin: "C10745821600",
		address: ["No. 8, Jalan Industri Puchong 3", "47100 Puchong, Selangor"],
		attention: "Mr. Lim Wei Jie, Sales",
		phone: "+60 3-8061 2290",
	},
	deliverTo: {
		name: "Kilang Roti Mutiara — Central Kitchen",
		address: ["Lot 22, Jalan Utas 15/7, Seksyen 15", "40200 Shah Alam, Selangor"],
		attention: "Encik Faizal, Store (Loading bay 2)",
		phone: "+60 12-338 7710",
	},
	lines: [
		{
			itemCode: "FLR-HP-25",
			description: "High-protein bread flour",
			detail: "Cap Sauh, 25 kg bag",
			quantity: "40",
			unit: "bag",
			unitPrice: "68.50",
			taxCode: "EX",
			amount: "2740.00",
		},
		{
			itemCode: "BTR-UNS-5",
			description: "Unsalted butter block",
			detail: "5 kg, chilled (2–4°C)",
			quantity: "12",
			unit: "blk",
			unitPrice: "142.00",
			taxRate: 5,
			taxCode: "ST5",
			amount: "1704.00",
		},
		{
			itemCode: "YST-INS-500",
			description: "Instant dry yeast",
			detail: "500 g vacuum pack",
			quantity: "24",
			unit: "pkt",
			unitPrice: "9.80",
			taxRate: 5,
			taxCode: "ST5",
			amount: "235.20",
		},
		{
			itemCode: "PKG-LOAF-600",
			description: "Printed loaf bag, 600 g",
			detail: "LDPE, 2-colour Mutiara print · 1,000 pcs/ctn",
			quantity: "10",
			unit: "ctn",
			unitPrice: "185.00",
			taxRate: 10,
			taxCode: "ST10",
			amount: "1850.00",
		},
		{
			itemCode: "TRY-SS-6040",
			description: "Stainless steel baking tray",
			detail: "600 × 400 mm, perforated",
			quantity: "20",
			unit: "pcs",
			unitPrice: "46.00",
			taxRate: 10,
			taxCode: "ST10",
			amount: "920.00",
		},
	],
	totals: {
		subtotal: "7449.20",
		taxes: [
			{ label: { en: "Sales tax", ms: "Cukai jualan" }, rate: 5, amount: "96.96" },
			{ label: { en: "Sales tax", ms: "Cukai jualan" }, rate: 10, amount: "277.00" },
		],
		shipping: "120.00",
		total: "7943.16",
	},
	deliveryInstructions:
		"Deliver Mon–Fri, 8.00 am – 3.00 pm to loading bay 2.\nButter must arrive chilled; temperature log required.\nQuote PO-2026-0088 on the delivery order and invoice.",
	termsAndConditions:
		"1. Goods must match the quotation and specification above.\n2. Short or damaged deliveries will be rejected at receiving.\n3. Invoices without a valid PO number will not be processed.",
	preparedBy: { name: "Nurul Huda Ismail", title: "Production Executive", date: "30 Oct 2026" },
	approvedBy: { name: "Tan Mei Ling", title: "Operations Manager" },
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

export default function PurchaseOrderDocumentDemo({ layout = "minimal", locale = "en" }) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<PurchaseOrderDocument order={PO} />
		</DocumentBrandProvider>
	);
}
