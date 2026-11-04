---
"@cynco-labs/ui": minor
---

One vocabulary across the accounting components.

Learn how one list reports what is ticked and you know them all; learn `onRowClick` on one table
and you know the rest. The six accounting modules each held their own spelling of the same idea,
and a consumer paid for it on every screen. This release settles on one name per idea, gives every
stateful accounting component a controlled form, and breaks the six 1,100-to-2,100-line modules
into folders of one feature each. Import paths do not change: `accounting/ledger.tsx` is now
`accounting/ledger/`, re-exported under the same names from the same place.

**Selection.** A list, table or board that selects many rows now takes `selectedIds`,
`defaultSelectedIds` and `onSelectionChange(ids: string[])`, which reports the whole new list. A
single card or row that is ticked on its own takes `selected`, `defaultSelected` and
`onSelectedChange(selected: boolean)`.

- `InvoiceListTable`: `onToggleRow` and `onToggleAll` → `selectedIds` / `defaultSelectedIds` /
  `onSelectionChange`.
- `ItemsListTable`: `selectedItems`, `onToggle` and `onToggleAll` → the same three.
- `BillsBoard`: `onToggleBill` → `selectedIds` / `defaultSelectedIds` / `onSelectionChange`.
- `BankFeedList`, `PayRunTable`, `CustomerListTable`, `VendorListTable`: `onSelectedChange` →
  `onSelectionChange`.
- `BillCard`: `onToggle(id)` → `onSelectedChange(selected)`, plus a new `defaultSelected`. The
  checkbox now appears when any of `selected`, `defaultSelected` or `onSelectedChange` is passed.

**Opening a row.** A list that opens a record hands over the whole row, as `DataList` already did.

- `CreditDebitNoteList`: `onOpen(id)` → `onRowClick(note)`.
- `QuotationBoardCard` and `QuotationBoardColumn`: `onOpen(id)` → `onRowClick(quotation)`.
- `PurchaseOrderLinkedBills`: `onOpen(id)` → `onRowClick(bill)`.
- `PayslipsRunTable`: `onOpen(id)` → `onRowClick(payslip)`.
- `BankPostingSummary`: `onSelect(key)` → `activeKey` / `defaultActiveKey` /
  `onActiveKeyChange(key)`. `onSelect` now means picking a value from candidates, and survives only
  on `AccountPickerField` and `ChartOfAccountsTree`.

**Actions carry ids, not labels.** `onAction` used to hand back the English on the button, so a
copy edit broke a consumer's `switch`.

- `InvoiceActionsPanel`: `onAction(label: string)` → `onAction(action: InvoiceAction)`, a union of
  `"send_email" | "send_reminder" | "mark_paid" | "download_receipt" | "edit_invoice" |
  "create_delivery_order" | "view_deliveries" | "create_credit_note" | "create_debit_note"`.
- `BillCard`: `onAction(bill, label: string)` → `onAction(bill, action: BillAction)`, a union of
  `"submit_for_review" | "approve" | "send_for_approval" | "reject" | "mark_awaiting_payment" |
  "resubmit_for_review" | "archive"`.
- `CustomerListTable` and `VendorListTable` drew a row menu that reported nothing, so Edit, Delete
  and the rest were decoration. Both now take `onAction(row, action)`: `CustomerAction` is
  `"edit" | "manage_contacts" | "delete"`, `VendorAction` is `"record_payment" | "edit" |
  "activate" | "deactivate" | "delete"`. A vendor's menu offers `activate` or `deactivate` by its
  `isActive`, so the two cases stay apart in a `switch`.

`BillAction`, `InvoiceAction`, `CustomerAction` and `VendorAction` are declared in one place and
re-exported from the components that use them; the names and members are unchanged.

**Other renames.** `PurchaseOrderLines`: `onChange` → `onLineItemsChange`, beside the `lineItems`
and `defaultLineItems` it already had. A native `onChange` handler now reaches the root element
instead of being shadowed.

**New controlled props.** Every one is optional and the uncontrolled behaviour is unchanged.
`AccountPickerField` gains `open` / `onOpenChange`. `ChartOfAccountsTree` gains `expandedIds` /
`onExpandedChange`. `CoaAccountPanel` gains `editing` / `onEditingChange`. `PeriodCloseChecklist`
gains `notes` / `defaultNotes` / `onNotesChange`. `RecordBillPaymentDialog` and
`InvoiceSummaryRail` gain `open` / `onOpenChange`. `CashFlowOverview` gains `range` /
`onRangeChange`. `EInvoiceStatusCard` gains `environment` / `defaultEnvironment` /
`onEnvironmentChange`. `FixedAssetOverview` gains `tab` / `onTabChange`. `QuotationBoardColumn`
gains a named `QuotationBoardColumnKey` for its `column` prop. `BankReconciliationYearStrip`
required `selected` and reported through `onMonthSelect`; it now takes `selected` /
`defaultSelected` / `onSelectedChange(period)` like every other stateful component, and works with
none of the three passed.

**Two props that were read once and then ignored.** Both seeded internal state on mount, dropped
every later value and fired no change event. If you passed either as a one-time seed, move to the
`default…` sibling or the field will now freeze on whatever you pass.

- `MarkAsPaidDialog`: `paymentMethod`, `bankAccount` and `note` are now the controlled values,
  beside new `defaultPaymentMethod` / `onPaymentMethodChange`, `defaultBankAccount` /
  `onBankAccountChange` and `defaultNote` / `onNoteChange`. Its `onConfirm` payload is now
  `{ method: PaymentMethod; bankAccount: string | null; note: string }`; a bank account never
  chosen arrives as `null` rather than `""`.
- `PayRunTable`: `scheduledDate` is now the controlled value, beside `defaultScheduledDate` and
  `onScheduledDateChange`.

**Payment methods.** `RecordBillPaymentDialog` drops the `"__none__"` sentinel from both pickers:
a payment method that was never chosen submits as `null`, and the bank account is `null` until one
is picked rather than a string that looks like an id. `"check"` is now spelled `"cheque"`, and `"e_wallet"` and
`"other"` join the list, so the bills dialog and `MarkAsPaidDialog` offer the same six methods.

**Keyboard.** `BankFeedList`, `BillsBoard` and `QuotationBoardColumn` were a tab stop per control
per row. Each is now one tab stop with roving focus: arrow keys move between rows and cards, Home
and End reach the first and last, and Enter or Space works the focused item. `BankFeedList` is an
ARIA grid, so left and right also move across a row's cells and the arrow keys cross day
boundaries; the boards are grids of one cell per card.

**Relative time.** `formatRelativeTime` is new and public, beside `formatDate`, and the three
private copies that disagreed with each other are gone. One ladder everywhere: `just now`, `5m
ago`, `3h ago`, `2d ago`, `3w ago`, `7mo ago`, with `maxUnit` deciding when a header falls back to
an absolute date. `QuotationBoardCard` therefore reads "3h ago" and "1d ago" where it used to read
"Today" and "Yesterday". `ReportToolbar` and `RecentActivityFeed` print exactly what they did.

**A bill status is a bill status.** `CyncoBill.status` was typed `CyncoBillStatus | string`, which
collapses to `string`, so a typo passed the compiler and rendered as itself. It is now
`CyncoBillStatus`, the ten states `BILL_STATUS` describes, and `BILL_STATUS` is exhaustive over
them. Read a status that came off the wire with the new `isBillStatus` guard before you pass it in;
`DocStatus` still prints an unknown one as a neutral chip wherever a raw string reaches a status
chip.

**Status vocabulary.** `PurchaseOrderLinkedBills` now reads bill status from the same table the
bills views use, so labels move to title case ("In review" → "In Review"), `approved` renders as a
success chip, `draft` and `void` gain glyphs, and `partially_paid` and `scheduled` stop falling
through to the raw status string. `BusinessHealthPanel` calls a `warn` check "Needs attention"
rather than "Drifting", which is what the period-close checklist calls the same severity; its tone
and glyph are unchanged and `HealthCheckStatus` still accepts `fail | warn | pass | na`.

**Layout primitives.** `PayslipSummary`'s contributions and `PurchaseOrderLinkedBills` were
hand-built tables and are now `DataList`, so they stack instead of overflowing in a narrow
container. The statement tables in `ProfitLossStatement` and `BalanceSheetStatement` take their
accessible name from a caption rather than `aria-label`.

`scripts/codemods/amount-literals.mjs` rewrites money written as a number into the decimal string
the library asks for (`total={1234.5}` → `total="1234.50"`). It asks the TypeScript compiler which
slots are typed `Amount` rather than matching prop names, so quantities are left alone; run it with
`--dry-run` first.

`PartyOverviewHeader`, `PartyRail` and `PartyTimeline` take `party` (`customer | vendor`) instead of `role`, which collided with the DOM `role` attribute their roots spread.
