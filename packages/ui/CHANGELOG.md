# @cynco-labs/ui

## 0.1.1

### Patch Changes

- f5a4b8f: One vocabulary across the accounting components.

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

- f5a4b8f: One concept, one component, across `base/general` and `base/table`.

  Fourteen exports that were variants of something the library already had are gone. Each had a
  survivor that does the same job, so a migration is a rename plus, in a few places, a prop. The
  codemod at `scripts/codemods/dedupe-components.mjs` does the renames (`--dry-run` reports first)
  and prints a file and line for every call site whose shape changed.

  **Removed, with what replaces each**

  - `FormLabel` → `Label`. `Label` gains `required`, which draws an asterisk and reads "(required)".
  - `FieldLabel` (the old one) and `LabelInput` → the new field kit: `Field`, `FieldLabel`,
    `FieldDescription`, `FieldControl`, `FieldError`. `FieldControl` is what hands the control its
    `id`, `aria-describedby` and `aria-invalid`, so the wiring cannot be forgotten. `FieldLabel`'s
    `tooltip` prop is now `hint`; its `description` is a `FieldDescription` sibling.
  - `TextCheckbox` → `<Label><Checkbox /> text</Label>`.
  - `IconCheckbox` → `ToggleButton`, which is what it always was: a button reporting `aria-pressed`,
    not a checkbox. `checked` → `pressed`, `defaultChecked` → `defaultPressed`, `onCheckedChange` →
    `onPressedChange`.
  - `CopyIconButton`, `MiniCopyButton`, `CopyTextButton` and `CopyableSpan` → `CopyButton` with
    `variant="icon"`, `"inline"`, `"text"` and `"inline"`. `MiniCopyButton`'s `displayText` is now
    `children`.
  - `IconTooltipButton` → `IconButton` with the new `tooltip` prop, which also names an icon-only
    button when no `aria-label` is given.
  - `SheetCloseButton` → `IconButton` with an X icon and `aria-label="Close"`. `SheetContent` already
    renders its own close button, which `hideCloseButton` turns off.
  - `useIsMobile` → `useContainerWidth`, which measures the component's own box with a
    ResizeObserver. The old hook read the viewport, which a container-query library should never do.

  **Changed**

  - `FieldError` and `fieldErrorProps` moved into the field kit. `lib/shared` re-exports them, so
    existing imports keep working, and `FieldError`'s `id` is now optional inside a `Field`.
  - `ConditionalTooltip`'s `contentClassName` is now `className`, and the rest of its props go to the
    popup.
  - `DataTable.PaginationFooter`, `CursorPagination` and `PageSizeSelector` are gone. One
    `DataTable.Pagination` pages a TanStack table, or a cursor-paged result when given `cursor`.
    `DataTable.Footer` is the same bar inside the table's own `<tfoot>`.
  - The data-table namespace is named `DataTable` at its source, not `Table` renamed on the way out.
  - `Pagination` keeps `Pagination`, `PaginationContent` and `PaginationItem`. The link-style parts
    beside them were never exported and are deleted.
  - A table set to `mobileCards` now swaps rows for cards when its own container is under 640px,
    rather than when the window is.
  - `InfoTooltip` moved from `general` to `ui`; its import from the package is unchanged.
  - Every component in `general` and `table` takes `className`, spreads its native props on its root
    and carries a `data-slot`. `SearchableSelect`, `DateInputUnix` and `TagSelect` accepted only a
    handful of ARIA props before and now accept the full set for the element they render.
  - `AreaCheckbox` no longer suppresses the static-interaction lint: the title is a real `Label`
    bound to the box, and the disabled reason goes through `ConditionalTooltip`.
  - `TagInput`'s field box is a `<label>`, so clicking it focuses the input without a handler on a
    plain div, and its remove buttons draw a focus ring. `TimePickerInput` draws one too.

- d8f2d9b: Polish before launch: one icon set, a lighter install, react-day-picker 10, and composable components throughout.

  - **Icons:** every component now uses Phosphor (already a peer dependency); `lucide-react` is no longer a dependency. Types that referred to Lucide (`CheckpointIconProps`, the `icon` prop of `ChainOfThoughtStep` and `Artifact` actions, `SmallSpinner` props) now use Phosphor's `Icon` and `IconProps`.
  - **Lighter install:** `ai`, `streamdown`, `shiki`, `use-stick-to-bottom`, `tokenlens`, `nanoid` and `@xyflow/react` are optional peer dependencies. Install them only if you use `@cynco-labs/ui/ai`.
  - **Breaking:** `react-day-picker` 8 → 10, which fixes the date-fns 4 peer conflict. `Calendar` takes react-day-picker 10 props: `captionLayout="dropdown"` (formerly `"dropdown-buttons"`) and `startMonth` / `endMonth` (formerly `fromYear` / `toYear`). `DateInputUnix` opens on the selected month.
  - **Tooltip** respects the nearest `TooltipProvider`'s delay; `delayDuration` still overrides it for one tooltip.
  - **Copy buttons** show "Copied" only when the clipboard write succeeded, and no longer throw on insecure origins.
  - **Saved table columns** no longer cause a hydration mismatch: the server renders the defaults and the browser then applies the saved set. A failed save keeps the toggles on screen, marked unsaved.
  - **No console output:** `PromptInputSpeechButton` reports recognition errors through `onSpeechError`, and dictated text now reaches a controlled textarea. `CodeBlock` falls back to plain text quietly. `ModelSelectorLogo` takes `src` so you can self-host the logos. The package no longer adds `SpeechRecognition` to the global `Window` type.
  - **Native props and `className` everywhere:** documents (`TaxInvoiceDocument` … `PayslipDocument` accept every `DocumentPage` option plus `<article>` props), document parts, `Money`, `AmountCell`, `ReportAmount`, `DetailRow`, `SectionLabel`, `DocStatus`, the accounting list tables, `KeyValueList`, `FilterChip`, `PageHeader`, `PageContainer`, `StepBadge`, `SectionTag`, `BetaBadge`, `LoadingShimmerText`, `CopyablePre`, `IconTooltipButton`, `SandboxBanner` and the table toolbar parts. **Breaking:** `InfoRow`'s `className` now styles the row; use `valueClassName` for the value.
  - **Controlled and uncontrolled:** `JournalLineEditor` (`defaultLines`), `AccountPickerField` and `ChartOfAccountsTree` (`defaultSelectedId`), `PeriodCloseAttentionCard` (`defaultNote`), `PurchaseOrderLines` (`defaultLineItems`), `TagInput` (`defaultValue`), `SearchableSelect` (`defaultValue`), `AreaCheckbox` and `IconCheckbox` (`defaultChecked`). These now follow later prop changes instead of keeping their first value. **Breaking:** `TagInput` and `TagSelect` report changes through `onValueChange` (was `onChange`). `CoaAccountPanel` shows `account.isActive` and reports Activate / Deactivate through `onActiveChange`.
  - `Money`, `AmountCell`, `ReportAmount`, `BracketedFigure` and `formatBracketed` accept decimal strings and format them exactly.
  - **Type scale:** every component now uses the theme's sizes. `Badge size="sm"` is 11px (was 10px), `DialogDescription` 13px (was 12.5px), and `StackBadge` inherits the theme font instead of forcing Inter. A new `text-display` (28px) covers hero figures such as `CashRunwayPosition`'s balance.
  - **Container-responsive:** `DialogFooter` places its buttons side by side while they fit and stacks them, primary on top, when they don't, whatever the viewport. `PageContainer`'s gutter follows the width it is given. `PanelButton` shrinks with its row (down to 80px wide) instead of staying 124×72. `TablePaginationFooter` hides its "Showing" and "Rows" labels by its own width.
  - `AgedReceivablesReport` prints each bucket's total and share without the shaded bars, per the black-ink rule for documents.
  - `RecentActivityFeed` no longer throws on an empty status.

- d8f2d9b: Launch readiness: server components, exact money, no Cynco defaults.

  - **React Server Components.** Built modules keep their `"use client"` directive, and pure helpers (`formatCurrency`, `formatDocAmount`, `amountInWords`, `draftLineTotals`, `salesLineAmount`, `buildSalesTotals`, `journalTotals`, `cn`…) live in server-safe modules, so a server component can import the package and call them. The build fails if a stateful module lacks the directive.
  - **Exact money.** Line amounts, totals, balances and outstanding amounts are computed in fixed-point decimals and rounded half-up once (1 × 1.15 at 10% is now 1.27, not 1.26). `toSen(1.005)` is 101. `formatCurrency` accepts grouped strings ("1,234.50"). Amount props in sales, parties, ledger and operations accept decimal strings as well as numbers. New `Amount` type and `journalTotals` in the money helpers.
  - **Breaking:** `buildSalesTotals` rows carry a `kind` and string values, and take optional `labels`; `SalesTotalRow` requires `kind`. `salesLineAmount` returns a decimal string.
  - **Breaking:** `CommandPalette` requires `items` and `ShortcutsDialog` requires `sections`. `CYNCO_PALETTE_ITEMS`, `CYNCO_SHORTCUT_SECTIONS`, `CYNCO_GOTO_ROUTES` and `brandFromCyncoTemplate` are removed; the docs demos show example data to copy.
  - **Base currency.** `DocBrand.baseCurrency` (default MYR) sets the currency documents convert into and default to; `ForeignCurrencyNote` takes `baseCurrency`.
  - **Every control can be wired.** New handler props, each hiding its control when omitted: `ReportToolbar` (`onPeriodChange`, `onViewChange`, `onCompareChange`, `onComparePeriodChange` with `default*` counterparts, `onSaveSnapshot` replacing `showSaveSnapshot`), `BankFeedList` (`query`, `status`, `onPostAll`, `onRestore`; `search` and `statusLabel` removed), `BankFeedRow.onRestore`, `BankReviewCard` (`onAcceptSuggestion`, `onChooseCategory`, `onChangeCategory`, `onExclude`, `onSkip`), `BankMonthProof` (`onUploadStatement`, `onLinkLedgerAccount`), `BankReconciliationYearStrip` (`onPreviousYear`, `onNextYear`, `onSelectedChange`), `BankRulesTable` (`query`, `status`, `onApplyToUnposted`, `onNewRule`, `onRowAction`; `search` removed), `BankAccountRail` (`defaultSelectedId`, `onSelectedIdChange`, `onAddAccount`, `onConnectProvider`), `InvoiceListTable.onRowAction`, `CreditDebitNoteList.onRowAction`, `PartyOverviewHeader` (`defaultTab`, `onStatement`, `onCreate`), `PartyRail` (`onAddContact`, `onEditContact`, `onSetPrimaryContact`), `BillsBoard.onPaidFilterClick`, `CashFlowOverview.onConnectBank`, `EInvoiceStatusCard` (`credentialsHref`, `correctionHref`, `validationUrl` on each environment), and `href` on `PeriodCloseAttentionCard` fixes.
  - `RecordBillPaymentDialog` parses the amount with `parseAmount` and submits the parsed figure; payment dates default to the local date, not UTC.
  - Removed from the public API: `getVisibleUsageColumnsFromStorage`, the time-picker helpers, `useNeedsScrollStop`, `STATUS_TONES` and `StatusToneName` (use `StatusTone`).

- f5a4b8f: One home for the shared parts of the layout, productivity and document components.

  No component's import path, props or markup changed, with one exception noted below. What changed is
  where the shared pieces live, so the next change has one place to make it.

  **Document colours are theme tokens.** The ink, paper and rule colours that every printed document
  uses were hex literals inside `documents/kit.tsx`, set inline on each sheet. They are now declared
  once in `styles/tokens.css` and exposed as Tailwind colours, so a document is styled the way the rest
  of the library is:

  | Was                         | Now                       | Utility                    |
  | --------------------------- | ------------------------- | -------------------------- |
  | `--doc-ink`                 | `--doc-ink`               | `text-doc-ink`             |
  | `--doc-muted`               | `--doc-ink-muted`         | `text-doc-ink-muted`       |
  | `--doc-subtle`              | `--doc-ink-subtle`        | `text-doc-ink-subtle`      |
  | `--doc-rule-strong`         | `--doc-rule`              | `border-doc-rule`          |
  | `--doc-rule` (the hairline) | `--doc-rule-soft`         | `border-doc-rule-soft`     |
  | `--doc-tint`                | `--doc-paper-tint`        | `bg-doc-paper-tint`        |
  | `--doc-tint-strong`         | `--doc-paper-tint-strong` | `bg-doc-paper-tint-strong` |
  | (new)                       | `--doc-paper`             | `bg-doc-paper`             |

  Note that `--doc-rule` and the old hairline swapped names, so a project that styled documents through
  these variables should run `node scripts/codemods/doc-tokens.mjs` over its own files rather than
  renaming by hand. They are declared on a plain `:root` and are never redefined under `.dark`: a
  document is paper in every theme, and prints the same from either.

  **One keyboard helper each.** `isMac`, `hasModKey`, `matchesCombo` and `isTypingTarget` live in
  `lib/keyboard.ts`. There were three different ideas of "the user is typing" across the layout and
  productivity components; the one that survives does not count a checkbox, radio or button as typing,
  so a bare-letter shortcut stays live over a column of tick boxes. `isMac` reads
  `navigator.userAgentData.platform` before the deprecated `navigator.platform`.

  **One controlled-state hook.** `value` / `defaultValue` / `onValueChange` goes through the base
  `useControllableState`, replacing two hand-rolled copies.

  **Printing no longer depends on a toast.** `PrintButton` mounts the `@page` setup and the print
  isolation rules itself. They used to ride along with `UndoToastViewport`, so a page with a print
  button and no toast viewport printed without them.

  **Removed:** `ReceiptDocument`'s `monochrome` prop. It set a brand accent that nothing read, because
  documents are monochrome by design; receipts print exactly as before.

  `AmountInput` now drops a stale draft while rendering rather than in an effect, so an amount changed
  from outside is never painted stale and then corrected.

- 295c312: Ship the `cynco-ui` agent skill at `skills/cynco-ui/SKILL.md`, and generate typed props for every component into `registry/props.json` (shown by `cynco-ui docs <Name>`).
- 67843e8: `Calendar` renders at full size again. Its root had become a size container (`@container`) while also shrinking to its content (`w-fit`), so it measured its own width as zero and collapsed to a 26px strip with the days spilling out. This also affected `DateInputUnix`'s popover. `check:classes` and `cynco-ui check` now fail on that combination (`container-shrink`).
- 67843e8: New CLI commands. `cynco-ui check [paths]` checks an app's source against the rules the components follow: hex and Tailwind palette colours, arbitrary type sizes, important utilities, `transition-all`, and floats on amounts. It prints each rule's reason, reads exceptions from `cynco-ui.allow`, and exits 1 on a violation. `cynco-ui skill [dir]` installs or updates the agent skill in `.claude/skills/cynco-ui/`. The library's own `check:classes` now runs the same rule set, and an allow entry that matches nothing now fails it, as the allow file always said it would.
- 67843e8: `cynco-ui search` matches each word on its own, in any order (`search date picker`, `search reconcile bank`), and lists name matches before description matches, with the shorter (primitive) name first. Filler words are skipped. If no component matches every word, it shows the ones matching the most and says so. Results stop at 20, with a count of the rest. `cynco-ui docs` with an unknown name suggests the closest components.
- f5a4b8f: The command palette names the row it is about to run.

  `CommandInput` points `aria-activedescendant` at the option the list highlights, at every moment.
  cmdk republishes that attribute only from inside its own state write, and that callback runs before
  React has moved `aria-selected` in the DOM, so the input named nothing when the palette opened and
  named a filtered-out row after a query narrowed the list. A screen-reader user pressing Enter on
  open therefore ran a command that was never read out. Every `Command`, `CommandDialog` and
  `CommandPalette` in the package gets the fix; nothing in the API changes.

  `CommandDialog` forwards `value`, `onValueChange`, `filter`, `shouldFilter`, `loop` and `label` to
  the `Command` it owns, instead of hard-coding the last two, so a caller can control the highlight or
  hand cmdk its own filter. **Breaking:** its remaining props now land on the dialog panel rather than
  on the dialog root; `open`, `defaultOpen`, `onOpenChange` and `modal` still reach the root by name.

  `CommandPalette` takes `className` and native div props and spreads them on its root: the card in
  `inline` mode, the dialog panel otherwise. The `aria-label` on its search box is gone, because cmdk
  names the input from the `Command`'s own label and the attribute never applied.

- 67843e8: Package metadata: `homepage` now points to the docs site (ui.cynco.io) instead of GitHub, `bugs` links to the issue tracker, and `keywords` are set so the package shows up in npm searches for accounting, ERP, invoicing and Malaysian e-invoicing.
- be210ff: Accessibility: every popover popup now has an accessible name (account pickers, date input, searchable select, AI context and citation cards); `DataList` and the financial report tables no longer emit empty header cells.
- e17bc2c: Components now server-render cleanly. Sheet no longer crashes on the server, ⌘/Ctrl keycaps and compact amounts match between server and browser, date-only values ("2026-10-30") show the same day in every timezone, server-rendered DataTable rows are no longer hidden until hydration, `aria-keyshortcuts` and keycaps hydrate with the right platform (`toAriaKeyShortcuts` takes an optional `mac`, and `useIsMac` is exported), CodeBlock shows its code immediately and no longer downloads Shiki's WASM engine, and font files are importable from `@cynco-labs/ui/fonts/*` for preloading.
- f0ac8e9: Types: the package now compiles under TypeScript `strict`. `GroupedTabButton` is generic over its value union, `Sources` takes `Collapsible` props, `Position` is re-exported from `@cynco-labs/ui/ai`, and `Select` consumers in `PayRunTable`, `RecordBillPaymentDialog` and `InvoiceLineItems` handle a cleared selection. Every docs demo is typechecked with the package.
