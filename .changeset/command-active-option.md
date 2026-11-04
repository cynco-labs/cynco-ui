---
"@cynco-labs/ui": patch
---

The command palette names the row it is about to run.

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
