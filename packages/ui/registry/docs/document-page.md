# DocumentPage

The document kit: a sheet of paper plus the parts every business document is assembled from — Letterhead, DocumentMeta, PartyGrid, DocumentTable, TotalsBlock, PaymentBlock, EInvoiceBlock, NotesBlock, SignatureBlock, DocumentFooter, DocFields, DocCallout, DocFigureStrip, DocAmountWords.

```tsx
import { DocumentPage } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import {
	DocItem,
	DocStack,
	DocumentBrandProvider,
	DocumentFooter,
	DocumentMeta,
	DocumentPage,
	DocumentTable,
	EInvoiceBlock,
	GroupedTabButton,
	Letterhead,
	PartyGrid,
	PaymentBlock,
	TotalsBlock,
	formatDocAmount,
} from "@cynco-labs/ui";

const BRAND = {
	company: {
		name: "Kedai Runcit Maju Jaya Sdn Bhd",
		registrationNo: "201901023456 (1334567-K)",
		sstNo: "W10-1808-32000001",
		tin: "C24681357900",
		address: ["No. 12, Jalan Tun Razak", "50400 Kuala Lumpur"],
		phone: "+60 3-2161 8800",
		email: "accounts@majujaya.my",
	},
	layout: "minimal",
	locale: "en",
	footerNote: "Thank you for your business.",
};

const BUYER = {
	name: "Nusantara Logistik Bhd",
	registrationNo: "200501012345 (689012-W)",
	tin: "C10987654320",
	address: ["Lot 8, Persiaran Klang", "41200 Klang, Selangor"],
	attention: "Puan Aisyah Rahman, Finance",
};

function Sheet(p) {
	return (
		<DocumentBrandProvider brand={Object.assign({}, BRAND, { layout: p.layout })}>
			<DocumentPage>
				<DocStack>
					<Letterhead title="taxInvoice" number="INV-2026-0142" />
					<DocumentMeta
						items={[
							{ label: "invoiceDate", value: "28 Oct 2026" },
							{ label: "dueDate", value: "27 Nov 2026" },
							{ label: "terms", value: "Net 30" },
							{ label: "reference", value: "PO-NL-7781" },
						]}
					/>
					<PartyGrid
						parties={[
							{ heading: "billTo", party: BUYER },
							{ heading: "shipTo", party: Object.assign({}, BUYER, { attention: "Warehouse B" }) },
						]}
					/>
					<DocumentTable
						numbered
						columns={[
							{
								key: "d",
								header: "description",
								cell: (r) => <DocItem title={r.d} detail={r.x} />,
							},
							{ key: "q", header: "qty", numeric: true, width: "16mm", cell: (r) => r.q },
							{
								key: "u",
								header: "unitPrice",
								numeric: true,
								width: "24mm",
								cell: (r) => formatDocAmount(r.u),
							},
							{ key: "s", header: "sst", numeric: true, width: "12mm", cell: (r) => r.s + "%" },
							{
								key: "a",
								header: "amount",
								numeric: true,
								width: "26mm",
								cell: (r) => formatDocAmount(r.a),
							},
						]}
						rows={[
							{
								d: "Warehouse racking installation",
								x: "Bay 3–5, incl. anchoring and safety inspection",
								q: "1",
								u: "12500.00",
								s: 8,
								a: "12500.00",
							},
							{
								d: "Forklift servicing",
								x: "Quarterly service, 3 units",
								q: "3",
								u: "480.00",
								s: 8,
								a: "1440.00",
							},
							{ d: "Pallet wrap film 500mm", q: "24", u: "38.50", s: 10, a: "924.00" },
						]}
					/>
					<TotalsBlock
						words
						rows={[
							{ label: "subtotal", value: "14864.00" },
							{ label: "SST", hint: "8%", value: "1115.20", kind: "tax" },
							{ label: "SST", hint: "10%", value: "92.40", kind: "tax" },
							{ label: "total", value: "16071.60", kind: "total" },
						]}
						aside={
							<PaymentBlock
								bankName="Maybank"
								accountName="Kedai Runcit Maju Jaya Sdn Bhd"
								accountNumber="5140 1234 5678"
								reference="INV-2026-0142"
							/>
						}
					/>
					<EInvoiceBlock status="pending" uuid="F9D425P6DS7D8IU0K2C8VXHF10" />
				</DocStack>
				<DocumentFooter />
			</DocumentPage>
		</DocumentBrandProvider>
	);
}

export default function DocumentPageDemo() {
	const [layout, setLayout] = useState("minimal");
	return (
		<div className="flex flex-col gap-3">
			<div className="w-[270px]">
				<GroupedTabButton
					value={layout}
					onValueChange={setLayout}
					options={[
						{ value: "minimal", label: "Minimal" },
						{ value: "classic", label: "Classic" },
						{ value: "modern", label: "Modern" },
					]}
				/>
			</div>
			<Sheet layout={layout} />
		</div>
	);
}
```

## Use

Build any printed document by composing the parts inside a DocumentPage, under a DocumentBrandProvider. Invoices, receipts, statements, payslips and reports in this group are all thin assemblies of these parts.

## Props

DocumentBrandProvider brand (company {name, registrationNo, tin, sstNo, address, phone, email, website}, logo (URL or element; typographic monogram when omitted), layout minimal (default) | classic | modern, font inter | geist | serif, locale en | ms | en-ms, labels overrides, signature, footerNote). DocumentPage: size a4 | a4-landscape | a5 | letter | receipt, stamp paid | void | draft | copy | overdue, fit, isolate, brand (override). Figures are decimal strings, printed as given.

## Notes

Black ink on white paper only — no colour, tints or filled bars; hierarchy from type, spacing and hairlines. In print: real paper size and margins, page numbers "2 / 3", headers repeat, rows never split, and only the document prints (isolate). On screen the sheet scales to its container. amountInWords writes Ringgit Malaysia in English or Malay; formatDocAmount and formatDocDate are exact and timezone-safe.

Category: Documents. Source: `packages/ui/src/documents/kit.tsx`.
