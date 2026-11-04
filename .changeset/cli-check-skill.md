---
"@cynco-labs/ui": patch
---

New CLI commands. `cynco-ui check [paths]` checks an app's source against the rules the components follow: hex and Tailwind palette colours, arbitrary type sizes, important utilities, `transition-all`, and floats on amounts. It prints each rule's reason, reads exceptions from `cynco-ui.allow`, and exits 1 on a violation. `cynco-ui skill [dir]` installs or updates the agent skill in `.claude/skills/cynco-ui/`. The library's own `check:classes` now runs the same rule set, and an allow entry that matches nothing now fails it, as the allow file always said it would.
