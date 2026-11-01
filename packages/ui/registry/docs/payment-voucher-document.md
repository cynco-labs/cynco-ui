# PaymentVoucherDocument

A payment voucher: payment date, method (bank transfer with reference, cheque with number, cash, DuitNow, card) and the account it was paid from, payee with bank details, 'Being payment for' purpose, the bills or expense lines paid with account codes, total paid in words, and a four-step approval chain.

```tsx
import { PaymentVoucherDocument } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { DocumentBrandProvider, GroupedTabButton, PaymentVoucherDocument } from "@cynco-labs/ui";

const LAYOUTS = [
	{ value: "minimal", label: "Minimal" },
	{ value: "classic", label: "Classic" },
	{ value: "modern", label: "Modern" },
];

const LOCALES = [
	{ value: "en", label: "EN" },
	{ value: "ms", label: "BM" },
	{ value: "en-ms", label: "EN + BM" },
];

function Tabs(p) {
	return (
		<div style={{ width: p.w }}>
			<GroupedTabButton value={p.value} onValueChange={p.onChange} options={p.options} />
		</div>
	);
}

function Shell(p) {
	const [l, setL] = useState("minimal"),
		[g, setG] = useState("en"),
		[z, setZ] = useState(p.sizes ? p.sizes[0].value : "a4");
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Tabs w="270px" value={l} onChange={setL} options={LAYOUTS} />
				<Tabs w="210px" value={g} onChange={setG} options={LOCALES} />
				{p.sizes ? <Tabs w="130px" value={z} onChange={setZ} options={p.sizes} /> : null}
			</div>
			<DocumentBrandProvider brand={Object.assign({}, p.brand, { layout: l, locale: g })}>
				{p.render(z)}
			</DocumentBrandProvider>
		</div>
	);
}

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

export default function PaymentVoucherDocumentDemo() {
	return <Shell brand={BRAND} render={() => <PaymentVoucherDocument voucher={PV} />} />;
}
```

## Use

Supporting document for every bill payment, expense claim reimbursement or petty-cash payout; filed with the bills for audit.

## Props

voucher: PaymentVoucherData { number, date, method: {kind: bank_transfer | cheque | cash | duitnow | card, chequeNo?, bank?, reference?}, paidFrom?: string | {name, accountNumber?}, currency?, payee: DocParty, payeeBank? {bankName?, accountName?, accountNumber?, swiftCode?}, memo?, lines: {reference?, date?, description, detail?, accountCode?, accountName?, amount}[], totals: {subtotal?, taxes?, total, …}, notes?, preparedBy?, checkedBy?, approvedBy?, receivedBy? }; plus brand?, size?, stamp?, fit?, isolate?, className.

## Notes

Credit notes netted off appear as negative lines in brackets. Cheque payments show the cheque number (emphasised) in place of the transaction ref. Signatures: Prepared by · Checked by · Approved by · Received by, in four columns, never split across pages. Fits one A4 in modern/minimal English; classic bilingual may move the signature row to page 2. Total in words follows the brand language (both lines when bilingual).

Category: Documents. Source: `packages/ui/src/documents/operations.tsx`.
