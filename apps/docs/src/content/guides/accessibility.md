---
title: Accessibility
description: Keyboard, focus, labels, contrast and status without colour alone.
---

Accountants spend whole days in these screens, often without touching the mouse. Cynco UI treats keyboard use, readable contrast and clear labels as part of each component, not as an afterthought.

## Built on accessible primitives

Dialogs, sheets, menus, selects, popovers, tooltips, tabs, accordions, checkboxes, radios and switches are built on [Base UI](https://base-ui.com), which provides the ARIA roles, focus management and keyboard behaviour of the WAI-ARIA patterns. The command palette uses [cmdk](https://cmdk.paco.me). Overlays trap focus while open and return it to the trigger when they close.

## Keyboard

- Every interactive element is reachable with Tab and operable with Enter or Space.
- `JournalGrid` behaves like a spreadsheet: Tab and Shift+Tab move across cells, Enter moves down and adds a line on the last one, arrow keys change line, Alt+B fills the balancing figure.
- `CommandPalette` opens with ⌘K or Ctrl+K; `ShortcutsDialog` opens with `?` and lists every shortcut on the page.
- `useHotkey("mod+k", fn)` registers page-wide shortcuts that stay out of the way while someone is typing in a field.
- `ShortcutButton` shows its shortcut in the button (⌘/Ctrl ↵ to submit a sheet), so shortcuts are discoverable.
- `UndoToast` offers Undo instead of a confirmation dialog: ⌘/Ctrl+Z undoes the newest action, F8 jumps to its Undo button.
- `InlineEditCell` is a button: Enter, Space or F2 starts editing, Enter saves, Esc cancels and focus returns to the cell.

## Focus

Focus is always visible. Inputs darken their border and add a soft 3px ring; buttons switch to a `primary` border on `focus-visible`; everything else gets an outline in the ring colour. Focus styles appear for keyboard users and not on mouse click.

## Labels

- Icon-only buttons need an accessible name. Pass `IconButton` a `tooltip` (its text becomes the label) or an `aria-label`.
- Form fields take a visible label. Use `Field` with `FieldLabel`, or a `Label` bound with `htmlFor`. Placeholders are examples, never labels.
- `ToneDot` is decorative (`aria-hidden`): put the meaning in nearby text.
- Live regions announce changes that happen away from focus: `BulkActionBar`'s count and total, `InlineEditCell`'s save status and the undo toast stack.

## Status never relies on colour

`StatusChip` pairs a coloured square with a glyph and a word: Paid has a green square, a check and the word "Paid". The label itself stays neutral, so the state reads correctly for colour-blind users, in greyscale and on paper. Use it for every document, payment and filing state.

In financial statements, negative figures are bracketed as well as red, and an exact zero is an em dash, so the meaning survives printing in black ink.

## Contrast

Text has four steps, each with a purpose: `foreground` for headings and primary values, `muted-foreground` for body copy, `tertiary-foreground` for captions and table cells, and `subtle` for quiet metadata only. `placeholder` is for placeholders and disabled labels and is not meant to meet text contrast.

For red text (errors, negative figures) use `error-text`, which stays readable in every theme; `destructive` is a fill colour.

The primary blue (`#0077e6`) carries white button labels at 4.4:1: AA for large text and just under AA for small text. Keep primary buttons to one per surface with short, medium-weight labels.

## Motion

Motion is short and functional: colour transitions on hover, accordions opening over 0.4s. There is no decorative animation. Loading shimmers are the only looping motion.

## Responsive and zoom

Components respond to the width of their container, so they keep working when a user zooms the browser to 200% or more: lists stack into cards, toolbars wrap and money never truncates. See [Layout](/layout).
