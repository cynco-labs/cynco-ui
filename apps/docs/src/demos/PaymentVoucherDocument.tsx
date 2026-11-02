import { DocumentBrandProvider, PaymentVoucherDocument } from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Teras Bina Konsult Sdn Bhd",
		registrationNo: "201301018842 (1048213-A)",
		tin: "C23817465020",
		address: ["Level 9, Menara Mutiara Bangsar, Jalan Liku", "59100 Kuala Lumpur"],
		phone: "+60 3-2282 6610",
		email: "finance@terasbina.com.my",
	},
};

const PV = {
	number: "PV-2026-0214",
	date: "2026-10-30",
	method: { kind: "bank_transfer", bank: "IBG", reference: "M2U-IBG-261030-58213" },
	paidFrom: { name: "Maybank Current", accountNumber: "5140 7782 2190" },
	payee: {
		name: "Nusantara Office Solutions Sdn Bhd",
		registrationNo: "201101009934 (936620-T)",
		sstNo: "W10-1808-32004417",
		tin: "C11290473810",
		address: ["No. 3, Jalan PJU 7/16A, Mutiara Damansara", "47800 Petaling Jaya, Selangor"],
		email: "ar@nusantaraoffice.my",
	},
	payeeBank: {
		bankName: "CIMB Bank Berhad",
		accountName: "Nusantara Office Solutions Sdn Bhd",
		accountNumber: "8008 4417 3925",
	},
	memo: "Office equipment lease, stationery and furniture for the KL office (September – October 2026 bills), net of credit note CN-NOS-0127.",
	lines: [
		{
			reference: "BILL-NOS-4471",
			date: "2026-09-15",
			description: "Copier lease — September 2026",
			detail: "Ricoh IM C3000 · incl. service tax 8%",
			accountCode: "6200-010",
			accountName: "Equipment rental",
			amount: "918.00",
		},
		{
			reference: "BILL-NOS-4502",
			date: "2026-09-30",
			description: "Stationery & toner",
			detail: "Toner ×6, A4 paper 40 reams",
			accountCode: "6110-002",
			accountName: "Printing & stationery",
			amount: "1246.30",
		},
		{
			reference: "BILL-NOS-4519",
			date: "2026-10-08",
			description: "Ergonomic task chairs",
			detail: "4 units, delivered & assembled",
			accountCode: "1500-200",
			accountName: "Office equipment",
			amount: "2760.00",
		},
		{
			reference: "CN-NOS-0127",
			date: "2026-10-12",
			description: "Credit note — returned toner",
			detail: "Against BILL-NOS-4502",
			accountCode: "6110-002",
			accountName: "Printing & stationery",
			amount: "-150.00",
		},
	],
	totals: { total: "4774.30" },
	preparedBy: { name: "Siti Mariam Yusof", title: "Account Executive", date: "30 Oct 2026" },
	checkedBy: { name: "Kevin Ong", title: "Finance Manager", date: "30 Oct 2026" },
	approvedBy: { name: "Ir. Ahmad Zulkifli", title: "Director" },
	receivedBy: { name: "", title: "Payee (name, IC & date)" },
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

export default function PaymentVoucherDocumentDemo({ layout = "minimal", locale = "en" }) {
	return (
		<DocumentBrandProvider brand={{ ...BRAND, layout, locale }}>
			<PaymentVoucherDocument voucher={PV} />
		</DocumentBrandProvider>
	);
}
