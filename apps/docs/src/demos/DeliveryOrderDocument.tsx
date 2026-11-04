import {
	type DeliveryOrderData,
	DeliveryOrderDocument,
	type DocLayout,
	type DocLocale,
	DocumentBrandProvider,
} from "@cynco-labs/ui";

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
	address: ["Lot 12A, Jalan Sungai Puloh, Kawasan Perindustrian Sungai Puloh", "42100 Klang, Selangor"],
	attention: "En. Hafiz Zainal, Facilities",
	phone: "+60 12-334 8821",
};

const DO: DeliveryOrderData = {
	number: "DO-2026-0087",
	status: "issued",
	date: "2026-10-21",
	deliveryDate: "2026-10-22",
	reference: "PO-NL-7781",
	salesOrder: "SO-2026-0064",
	invoiceNo: "INV-2026-0142",
	billTo: NUSA,
	shipTo: NUSA_SITE,
	vehicleNo: "WXY 4821 · 3-tonne lorry",
	driver: "Muthu a/l Ramasamy · 012-778 3310",
	packages: "6 pallets, 4 cartons",
	weight: "1,148 kg",
	lines: [
		{
			code: "JKM-580N",
			description: "Jinko Tiger Neo 580W N-type mono panel",
			detail: "Pallet 1–4 · 22 pcs",
			unit: "pcs",
			ordered: "22",
			delivered: "22",
			backOrdered: "0",
		},
		{
			code: "HW-12KTL-M5",
			description: "Huawei SUN2000-12KTL-M5 string inverter",
			detail: "S/N HV2310045872",
			unit: "unit",
			ordered: "1",
			delivered: "1",
		},
		{
			code: "MR-AL42",
			description: "Aluminium mounting rail 4.2 m",
			detail: "Balance 6 pcs to follow on DO-2026-0091",
			unit: "pcs",
			ordered: "36",
			delivered: "30",
			backOrdered: "6",
		},
		{
			code: "CBL-6C4",
			description: "AC cable 6mm² 4-core XLPE/SWA",
			unit: "m",
			ordered: "120",
			delivered: "120",
		},
		{
			code: "MC4-PR",
			description: "MC4 connector, male/female pair",
			unit: "pair",
			ordered: "24",
			delivered: "24",
		},
		{
			code: "ACC-CLMP",
			description: "Mid and end clamps, stainless steel",
			unit: "set",
			ordered: "48",
			delivered: "40",
			backOrdered: "8",
		},
	],
	notes:
		"Please inspect all items on delivery. Report any shortage or damage within 3 working days. Panels must be stored flat and covered.",
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

export default function DeliveryOrderDocumentDemo({
	layout = "minimal",
	locale = "en",
}: {
	layout?: DocLayout;
	locale?: DocLocale;
}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<DeliveryOrderDocument order={DO} />
		</DocumentBrandProvider>
	);
}
