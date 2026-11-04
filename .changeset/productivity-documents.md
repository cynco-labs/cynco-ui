---
"@cynco-labs/ui": minor
---

One home for the shared parts of the layout, productivity and document components.

No component's import path, props or markup changed, with one exception noted below. What changed is
where the shared pieces live, so the next change has one place to make it.

**Document colours are theme tokens.** The ink, paper and rule colours that every printed document
uses were hex literals inside `documents/kit.tsx`, set inline on each sheet. They are now declared
once in `styles/tokens.css` and exposed as Tailwind colours, so a document is styled the way the rest
of the library is:

| Was | Now | Utility |
| --- | --- | --- |
| `--doc-ink` | `--doc-ink` | `text-doc-ink` |
| `--doc-muted` | `--doc-ink-muted` | `text-doc-ink-muted` |
| `--doc-subtle` | `--doc-ink-subtle` | `text-doc-ink-subtle` |
| `--doc-rule-strong` | `--doc-rule` | `border-doc-rule` |
| `--doc-rule` (the hairline) | `--doc-rule-soft` | `border-doc-rule-soft` |
| `--doc-tint` | `--doc-paper-tint` | `bg-doc-paper-tint` |
| `--doc-tint-strong` | `--doc-paper-tint-strong` | `bg-doc-paper-tint-strong` |
| (new) | `--doc-paper` | `bg-doc-paper` |

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
