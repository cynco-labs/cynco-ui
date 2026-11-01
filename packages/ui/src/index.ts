/**
 * @cynco-labs/ui — Cynco's design system for accounting and ERP interfaces.
 *
 * - Base components: buttons, inputs, menus, dialogs, sheets, tables, charts (Base UI + Tailwind).
 * - Layout primitives: DataList, StatGrid/StatTile, SectionPanel, KeyValueList, ActionBar, ScrollRow, density.
 * - Productivity: JournalGrid, AmountInput, InlineEditCell, CommandPalette, ShortcutsDialog, SavedViewsBar,
 *   BulkActionBar, UndoToast, DensityToggle, PrintButton.
 * - Documents: the document kit and invoices, receipts, statements, payslips and financial reports.
 * - Accounting: invoicing, ledger, banking, reports, parties and operations components.
 *
 * AI chat and workflow components live in `@cynco-labs/ui/ai`.
 */
export * from "./base";
export { Table as DataTable } from "./base/components/table";

// Money, formatting, layout primitives, the document kit (re-exported by shared)
export * from "./lib/shared";

// Productivity
export * from "./productivity/entry";
export * from "./productivity/navigation";
export * from "./productivity/workflow";

// Documents
export * from "./documents/sales";
export * from "./documents/operations";
export * from "./documents/reports";
export * from "./documents/studio";

// Accounting
export * from "./accounting/sales";
export * from "./accounting/ledger";
export * from "./accounting/banking";
export * from "./accounting/reports";
export * from "./accounting/parties";
export * from "./accounting/operations";
