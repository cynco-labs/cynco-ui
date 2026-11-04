---
"@cynco-labs/ui": patch
---

`Calendar` renders at full size again. Its root had become a size container (`@container`) while also shrinking to its content (`w-fit`), so it measured its own width as zero and collapsed to a 26px strip with the days spilling out. This also affected `DateInputUnix`'s popover. `check:classes` and `cynco-ui check` now fail on that combination (`container-shrink`).
