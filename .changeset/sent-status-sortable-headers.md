---
"@cynco-labs/ui": patch
---

`INVOICE_STATUS` has a `sent` status, labelled "Sent". Use it for an invoice that has been emailed; `finalized` still reads "Pending". `InvoiceActionsPanel` treats `sent` as a finalized invoice that was already emailed, so it offers a reminder rather than "Send email".

`DataTable.Header` shows sort buttons whenever the table can sort (it has `getSortedRowModel` or `manualSorting`). Before, it also needed `config.enableSorting`, and without it a sortable table showed plain headers. Pass `enableSorting: false` to hide them.

`InvoiceListTable` on a phone shows the invoice number, issue date and due date on one line instead of a labelled row per field, and customer names wrap to two lines. The email-problem signal is an envelope icon. The "Not posted to GL" signal now shows only when `journalEntryId` is `null`: leaving the field out means the list doesn't track posting, so pass `null` for an unposted invoice to keep the signal.

`PageHeader` and `DataTable.Heading` titles use the foreground colour at medium weight instead of the muted colour.

`InvoiceLineItems` no longer shows "Enter an item name" on a fresh blank line. A line is flagged once its name field loses focus, or straight away with the new `showErrors` prop (for example after a save attempt).

`InvoiceTotalsPanel` and `InvoiceSummaryRail` no longer print a minus sign on rows that don't set `negative`; `buildSalesTotals` leaves it unset on the subtotal and tax rows, so those showed as "−RM 100.00".

`buildSalesTotals` keeps every tax row it is given, zero included; it used to drop zero taxes, so a fresh invoice form showed no tax line. The new `salesLineTotals(items, taxCodes)` returns the subtotal and one tax per taxed code from the line items, rounded per line like `salesLineAmount`, so `buildSalesTotals(salesLineTotals(items))` is the whole calculation.

`SearchableSelect` shows its `placeholder` when nothing is selected and a custom `renderValue` returns nothing, instead of an empty trigger.
