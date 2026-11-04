---
"@cynco-labs/ui": patch
---

`cynco-ui search` matches each word on its own, in any order (`search date picker`, `search reconcile bank`), and lists name matches before description matches, with the shorter (primitive) name first. Filler words are skipped. If no component matches every word, it shows the ones matching the most and says so. Results stop at 20, with a count of the rest. `cynco-ui docs` with an unknown name suggests the closest components.
