---
"@cynco-labs/ui": patch
---

Components now server-render cleanly. Sheet no longer crashes on the server, ⌘/Ctrl keycaps and compact amounts match between server and browser, date-only values ("2026-10-30") show the same day in every timezone, server-rendered DataTable rows are no longer hidden until hydration, `aria-keyshortcuts` and keycaps hydrate with the right platform (`toAriaKeyShortcuts` takes an optional `mac`, and `useIsMac` is exported), CodeBlock shows its code immediately and no longer downloads Shiki's WASM engine, and font files are importable from `@cynco-labs/ui/fonts/*` for preloading.
