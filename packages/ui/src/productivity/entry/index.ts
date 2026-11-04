/**
 * Cynco UI — fast data entry (group "Cynco · Productivity").
 *
 * New productivity primitives for the screens accountants type into all day: journal entries,
 * bills, expense claims and bank-line descriptions. Not ports of existing screens — built so they
 * can drop into Cynco's production code: keyboard first, controlled or uncontrolled, sized by their
 * CONTAINER (`@container` + `@xl:`), tokens only.
 *
 * - AmountInput     the money field: plain figures, accounting brackets, 1.2k, and formulas.
 * - JournalGrid     spreadsheet-fast journal line editor with a sticky Dr/Cr balance footer.
 * - InlineEditCell  click / Enter / F2 to edit a table cell in place, with async save states.
 *
 * Money in every API is a decimal string ("1234.50"), never a float; maths goes through `./money`.
 */

export { AmountInput, type AmountInputProps } from "./amount-input";
export { InlineEditCell, type InlineEditCellProps } from "./inline-edit-cell";
export { JournalGrid, type JournalGridAccount, type JournalGridLine, type JournalGridProps } from "./journal-grid";
