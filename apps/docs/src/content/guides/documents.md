---
title: Documents
description: The document kit behind every invoice, receipt, statement, payslip and report; brand, layouts, languages, print and PDF.
---

Every printed document in Cynco UI is built from one **document kit**, so tax invoices, receipts, statements, payslips and financial reports share layout, typography, language and print behaviour, and a brand change is one prop.

## Black ink only

Documents never use colour: no tinted panels, no filled bars, no coloured totals or stamps. Hierarchy comes from type size, weight, spacing and hairline rules. The customer's own logo is the only colour that can appear. Paper is white in every app theme, including dark mode.

## Brand, set once

`DocumentBrandProvider` takes the company details, logo (or a typographic monogram), layout, typeface, language and footer note. Every document inside picks them up.

```tsx
import { DocumentBrandProvider, TaxInvoiceDocument } from "@cynco-labs/ui";

const brand = {
	company: {
		name: "Arus Teknik Sdn Bhd",
		registrationNo: "201801034567 (1295521-D)",
		sstNo: "B16-1809-32000417",
		tin: "C25718364020",
		address: ["No. 18, Jalan Pelabur 23/1, Seksyen 23", "40300 Shah Alam, Selangor"],
		email: "accounts@arusteknik.my",
	},
	layout: "minimal",
	locale: "en",
	footerNote: "Thank you for your business.",
};

export function InvoicePage({ invoice }) {
	return (
		<DocumentBrandProvider brand={brand}>
			<TaxInvoiceDocument invoice={invoice} />
		</DocumentBrandProvider>
	);
}
```

| Option | Values |
| --- | --- |
| Layout | **Minimal** (default), **Classic** with the Newsreader serif, **Modern** with a stronger sans headline |
| Typeface | Inter, Geist or Newsreader |
| Language | English (`en`), Bahasa Melayu (`ms`) or both (`en-ms`, labels stacked or slashed) |

[`DocumentStudio`](/components/document-studio) is the editor for the brand, with a live preview of any document at any paper size and stamp.

## The documents

| Sales | Operations | Reports |
| --- | --- | --- |
| [`TaxInvoiceDocument`](/components/tax-invoice-document) | [`PurchaseOrderDocument`](/components/purchase-order-document) | [`ProfitAndLossReport`](/components/profit-and-loss-report) |
| [`QuotationDocument`](/components/quotation-document) | [`PaymentVoucherDocument`](/components/payment-voucher-document) | [`BalanceSheetReport`](/components/balance-sheet-report) |
| [`AdjustmentNoteDocument`](/components/adjustment-note-document) (credit and debit notes) | [`StatementOfAccountDocument`](/components/statement-of-account-document) | [`TrialBalanceDocument`](/components/trial-balance-document) |
| [`ReceiptDocument`](/components/receipt-document) (A4, A5, 80mm thermal) | [`PayslipDocument`](/components/payslip-document) (EPF, SOCSO, EIS, PCB, HRDF) | [`GeneralLedgerReport`](/components/general-ledger-report) |
| [`DeliveryOrderDocument`](/components/delivery-order-document) | | [`AgedReceivablesReport`](/components/aged-receivables-report), [`CashFlowReport`](/components/cash-flow-report) |

## The parts

Build a new document from the same parts the built-in ones use:

- [`DocumentPage`](/components/document-page): the sheet. A4, A4 landscape, A5, Letter or an 80mm receipt, with Paid, Void, Draft, Copy and Overdue stamps.
- `Letterhead`, `DocumentMeta`, `PartyGrid`: the header, the number and date band, bill-to and ship-to.
- `DocumentTable`: line items with numbered rows and repeating headers.
- `TotalsBlock` (with the amount in words), `PaymentBlock`, `EInvoiceBlock`, `NotesBlock`, `SignatureBlock`, `DocumentFooter`.
- `DocFields`, `DocCallout`, `DocFigureStrip`, `DocAmountWords` for smaller pieces; reports add `ReportHeader` and `StatementTable`.

## Rules

- **One typed data prop per document**, and figures print exactly as given. A document never recalculates posted totals; `draftLineTotals` is only for unsaved drafts.
- **Labels live in one English and Malay dictionary.** Pass a label key (`"invoiceDate"`, `"subtotal"`) or `{ en, ms }` for custom text; never hard-code a label inside a document.
- **The e-invoice QR is never faked.** Pass the real QR element from MyInvois once the invoice is validated; until then a clear placeholder shows.
- `amountInWords` writes Ringgit Malaysia in English or Malay; `formatDocAmount` and `formatDocDate` are exact and timezone-safe.

## Print and PDF

Documents print at their real paper size and margins, with page numbers ("2 / 3"), table headers that repeat on every page, rows that never split, and totals and signature blocks kept together. With `isolate` (the default) only the document prints, not the app around it.

On screen the sheet scales to fit its container, so the same component is the in-app preview. Add [`PrintButton`](/components/print-button) next to a document for a print action with a ⌘/Ctrl+P shortcut, or pass `onPrint` to route printing elsewhere, such as a server-rendered PDF.

The same HTML renders to PDF with headless Chrome:

```ts
import puppeteer from "puppeteer";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(`https://app.example.com/print/invoices/${id}`, { waitUntil: "networkidle0" });
const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
await browser.close();
```

`preferCSSPageSize` lets the document's own `@page` size (A4, A5, Letter or 80mm) set the paper.
