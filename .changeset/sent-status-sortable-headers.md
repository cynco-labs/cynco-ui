---
"@cynco-labs/ui": patch
---

`INVOICE_STATUS` has a `sent` status, labelled "Sent". Use it for an invoice that has been emailed; `finalized` still reads "Pending". `InvoiceActionsPanel` treats `sent` as a finalized invoice that was already emailed, so it offers a reminder rather than "Send email".

`DataTable.Header` shows sort buttons whenever the table can sort (it has `getSortedRowModel` or `manualSorting`). Before, it also needed `config.enableSorting`, and without it a sortable table showed plain headers. Pass `enableSorting: false` to hide them.

`InvoiceListTable` on a phone shows the invoice number, issue date and due date on one line instead of a labelled row per field, and customer names wrap to two lines. The email-problem signal is an envelope icon. The "Not posted to GL" signal now shows only when `journalEntryId` is `null`: leaving the field out means the list doesn't track posting, so pass `null` for an unposted invoice to keep the signal.

`PageHeader` and `DataTable.Heading` titles use the foreground colour at medium weight instead of the muted colour.
