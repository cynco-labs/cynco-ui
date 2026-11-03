---
"@cynco-labs/ui": patch
---

Types: the package now compiles under TypeScript `strict`. `GroupedTabButton` is generic over its value union, `Sources` takes `Collapsible` props, `Position` is re-exported from `@cynco-labs/ui/ai`, and `Select` consumers in `PayRunTable`, `RecordBillPaymentDialog` and `InvoiceLineItems` handle a cleared selection. Every docs demo is typechecked with the package.
