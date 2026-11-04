import { type DocLayout, type DocLocale, DocumentBrandProvider, StatementOfAccountDocument } from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Pengedar Minuman Borneo Sdn Bhd",
		registrationNo: "201201031275 (1015489-V)",
		sstNo: "S10-1810-32000985",
		tin: "C24019873640",
		address: ["Lot 5, Lorong Kolombong Jaya 2, Inanam", "88450 Kota Kinabalu, Sabah"],
		phone: "+60 88-431 220",
		email: "ar@pmborneo.com.my",
	},
	footerNote: "Thank you for your continued support.",
};

const SOA = {
	number: "SOA-2026-10-0147",
	date: "2026-10-31",
	periodFrom: "2026-10-01",
	periodTo: "2026-10-31",
	accountNo: "C-0147",
	terms: "Net 14",
	party: {
		name: "Kafe Pelangi Enterprise",
		registrationNo: "202003154872 (KT0458721-X)",
		tin: "IG24758193020",
		address: ["G-12, Imago Shopping Mall, Jalan Coastal", "88000 Kota Kinabalu, Sabah"],
		attention: "Ms. Joanne Chong",
	},
	openingBalance: "6480.50",
	totalDebit: "14278.05",
	totalCredit: "8185.30",
	closingBalance: "12573.25",
	transactions: [
		{
			date: "2026-10-02",
			type: "payment",
			number: "OR-2026-0611",
			description: "Payment received — DuitNow",
			credit: "3200.00",
			balance: "3280.50",
		},
		{
			date: "2026-10-03",
			type: "invoice",
			number: "INV-2026-1402",
			description: "Soft drinks & mineral water, 48 ctn",
			debit: "1862.40",
			balance: "5142.90",
		},
		{
			date: "2026-10-07",
			type: "invoice",
			number: "INV-2026-1419",
			description: "Arabica beans 1 kg × 20, syrups",
			debit: "2315.00",
			balance: "7457.90",
		},
		{
			date: "2026-10-09",
			type: "creditNote",
			number: "CN-2026-0088",
			description: "Damaged cartons returned (INV-2026-1402)",
			credit: "124.80",
			balance: "7333.10",
		},
		{
			date: "2026-10-10",
			type: "invoice",
			number: "INV-2026-1433",
			description: "Juice concentrate, 12 btl",
			debit: "986.50",
			balance: "8319.60",
		},
		{
			date: "2026-10-14",
			type: "invoice",
			number: "INV-2026-1450",
			description: "Mineral water 1.5 L, 60 ctn",
			debit: "1540.00",
			balance: "9859.60",
		},
		{
			date: "2026-10-15",
			type: "payment",
			number: "OR-2026-0648",
			description: "Payment received — IBG",
			credit: "2860.50",
			balance: "6999.10",
		},
		{
			date: "2026-10-17",
			type: "invoice",
			number: "INV-2026-1468",
			description: "Arabica beans, fresh milk, syrups",
			debit: "2104.20",
			balance: "9103.30",
		},
		{
			date: "2026-10-21",
			type: "invoice",
			number: "INV-2026-1481",
			description: "Paper cups 12 oz, 20 ctn",
			debit: "760.00",
			balance: "9863.30",
		},
		{
			date: "2026-10-22",
			type: "debitNote",
			number: "DN-2026-0019",
			description: "Re-delivery charge, 20 Oct",
			debit: "45.00",
			balance: "9908.30",
		},
		{
			date: "2026-10-24",
			type: "invoice",
			number: "INV-2026-1497",
			description: "Soft drinks, 32 ctn",
			debit: "1318.75",
			balance: "11227.05",
		},
		{
			date: "2026-10-28",
			type: "payment",
			number: "OR-2026-0702",
			description: "Part payment — cheque 118842",
			credit: "2000.00",
			balance: "9227.05",
		},
		{
			date: "2026-10-29",
			type: "invoice",
			number: "INV-2026-1510",
			description: "Arabica beans, oat milk, cups",
			debit: "2452.80",
			balance: "11679.85",
		},
		{
			date: "2026-10-31",
			type: "invoice",
			number: "INV-2026-1524",
			description: "Mineral water 500 ml, 40 ctn",
			debit: "893.40",
			balance: "12573.25",
		},
	],
	aging: {
		current: "7574.15",
		days1to30: "4579.10",
		days31to60: "0.00",
		days61to90: "420.00",
		days90plus: "0.00",
	},
	totalDue: "12573.25",
	payment: {
		bankName: "Public Bank",
		accountName: "Pengedar Minuman Borneo Sdn Bhd",
		accountNumber: "3197 5520 14",
		reference: "C-0147",
	},
	notes: "RM 420.00 from INV-2026-1188 (August) is now over 60 days. Please settle to avoid a hold on deliveries.",
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

export default function StatementOfAccountDocumentDemo({
	layout = "minimal",
	locale = "en",
}: {
	layout?: DocLayout;
	locale?: DocLocale;
}) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<StatementOfAccountDocument statement={SOA} />
		</DocumentBrandProvider>
	);
}
