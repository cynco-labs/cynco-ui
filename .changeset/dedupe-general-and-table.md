---
"@cynco-labs/ui": minor
---

One concept, one component, across `base/general` and `base/table`.

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
