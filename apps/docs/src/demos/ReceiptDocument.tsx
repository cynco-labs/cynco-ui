import {
	type DocBrand,
	type DocLayout,
	type DocLocale,
	DocumentBrandProvider,
	type ReceiptData,
	ReceiptDocument,
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

const CHEQUE: ReceiptData = {
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

const CASH: ReceiptData = {
	number: "OR-2026-0318",
	status: "issued",
	date: "2026-11-01",
	receivedFrom: {
		name: "Ahmad Faizal bin Rahman",
		address: ["No. 22, Jalan Anggerik 3, Taman Sri Muda", "40400 Shah Alam, Selangor"],
	},
	payment: { method: "cash" },
	amountReceived: "1284.40",
	allocations: [{ number: "INV-2026-0151", date: "2026-10-29", invoiceAmount: "1284.42", applied: "1284.42" }],
	totals: [
		{ label: "totalDue", value: "1284.42" },
		{ label: "rounding", value: "-0.02", kind: "rounding" },
		{ label: "amountReceived", value: "1284.40", kind: "total" },
		{ label: "cashTendered", value: "1300.00" },
		{ label: "change", value: "15.60" },
	],
	notes: "Rounded to the nearest 5 sen (BNM rounding mechanism).",
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
			{ value: "receipt", label: "80mm" },
		],
		default: "a4",
	},
	payment: {
		label: "Paid by",
		options: [
			{ value: "cheque", label: "Cheque" },
			{ value: "cash", label: "Cash" },
		],
		default: "cheque",
	},
};

export default function ReceiptDocumentDemo({
	layout = "minimal",
	locale = "en",
	size = "a4",
	payment = "cheque",
}: {
	layout?: DocLayout;
	locale?: DocLocale;
	size?: "a4" | "a5" | "receipt";
	payment?: string;
}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<div className={size === "a4" ? undefined : "flex justify-center"}>
				<ReceiptDocument receipt={payment === "cash" ? CASH : CHEQUE} size={size} fit="width" />
			</div>
		</DocumentBrandProvider>
	);
}
