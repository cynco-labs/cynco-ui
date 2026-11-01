---
title: Layout and responsiveness
description: Container queries, the layout primitives and the rules that keep every screen working from 320px to a full page.
---

Every Cynco UI component works from 320px to a full page **of its own width**. A list in a page, the same list in a side sheet and the same list on a phone all lay themselves out correctly, because components respond to their container, not the viewport.

## Container queries

Each component root sets `@container`, and its children use Tailwind's container variants: `@sm` `@md` `@lg` `@xl` `@2xl` `@3xl` (24, 28, 32, 36, 42 and 48rem). That is why every example on this site has a **Phone** toggle: it narrows the frame to 360px and the component reflows exactly as it would in a narrow column or on a phone.

```tsx
<div className="@container">
	<div className="grid gap-3 @xl:grid-cols-2">
		<SectionPanel title="Receivables">…</SectionPanel>
		<SectionPanel title="Payables">…</SectionPanel>
	</div>
</div>
```

## The primitives

Screens are composed from a small set of layout primitives. They hold the responsive behaviour and the surface styling in one place, so a screen never hand-rolls a table or a KPI row.

| Primitive | What it does |
| --- | --- |
| [`DataList`](/components/data-list) | Any list of records. A tray table on wide containers, one card per row below `stackBelow` (`xl`, 36rem, by default). Columns declare their role in the stacked view: `title`, `value`, `badge`, `meta` or `hidden`. Handles selection, clickable rows, totals, row menus and empty states. |
| [`StatGrid` and `StatTile`](/components/stat-tile) | KPI rows that auto-fit: 4-up on a page, 2-up in a sheet, 1-up on a phone. Values wrap between words and never truncate. |
| [`SectionPanel`](/components/section-panel) | A titled card whose header actions wrap under the title when narrow. |
| [`KeyValueList`](/components/key-value-list) | Label and value rows (totals, detail rails) that stack below 16rem. |
| [`ActionBar`](/components/action-bar) | A toolbar that wraps. `ScrollRow` is one row that scrolls sideways, for tabs and steppers. |
| [`ToneDot`](/components/tone-dot) | Status dots and bars (`toneBg` for the class). |

`DensityProvider` with `DensityToggle` switches every `DataList` inside between compact, default and comfortable rows. `DataList` also takes `stickyHeader` and `maxHeight` so headers and totals stay in view while rows scroll.

## Rules

- **No fixed pixel widths** on component roots and no `grid-cols-4` without a narrow fallback.
- **Lists stack** into one card per row (`DataList`); **KPI rows auto-fit** (`StatGrid`); **toolbars wrap** (`ActionBar`); **tabs and steppers scroll sideways** (`ScrollRow`).
- **Editors with many inputs per line become one card per line**: journal, invoice and purchase-order line editors are a grid on wide containers and a card per line on narrow ones. Inputs stay at least 6rem wide.
- **Money and document numbers never truncate or wrap mid-figure.** Let labels wrap instead.
- **Every component takes `className`** (merged with `cn()`, which knows the type classes) and passes other native props to its root.
- Check at 360, 768 and 1280px: no page overflow, nothing escaping its container, no clipped money.

## Surfaces

The class names for Cynco UI's surfaces are exported as `surfaces`, so custom screens match the components:

| Name | Use |
| --- | --- |
| `surfaces.tray` | The table tray band (`table-tray`) that holds a list. |
| `surfaces.surface` | The raised table surface inside the tray. |
| `surfaces.card` | Cards and inline panels. |
| `surfaces.negative` | Red text (`error-text`) for negative figures; `negativeClass(isNegative)` returns it conditionally. |

## Spacing and shape

Tailwind's 4px unit. The most used steps are 8px (`gap-2`, control padding), 6px (icon to label) and 12 to 16px (card and panel padding). Controls are compact: inputs, selects and default buttons are 28px tall; small and icon buttons 24px.

Radius is 6px on buttons, inputs and menus, 4px on menu items, 2px on checkboxes, 10px on cards and alerts and 12px on large panels. Borders are 1px `border` everywhere by default; inputs use `input`. Shadows are faint and there are no coloured glows except the selected `PanelButton`.
