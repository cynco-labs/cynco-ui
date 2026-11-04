# CopyButton

One copy-to-clipboard button in three shapes, each confirming with the same "Copied!" tooltip.

```tsx
import { CopyButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CopyButton } from "@cynco-labs/ui";

export default function CopyButtonDemo() {
	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<CopyButton text="INV-2026-0142" />
				<CopyButton variant="icon" text="cy_sk_test_7f3a91" />
			</div>
			<CopyButton variant="inline" text="1200-001" />
		</div>
	);
}
```

## Use

`text` for an ID shown as a chip, `icon` for a glyph beside existing text, `inline` for a mono ID in a table, whose glyph appears on hover, focus and every touch screen.

## Props

`text` to copy, optional `children` to show something shorter, `variant` (`text` · `icon` · `inline`) and `side` for the tooltip.

- `text`: `string`. The string put on the clipboard.
- `variant?`: `"text" | "icon" | "inline"`. `text` is a labelled chip, `icon` is the glyph alone, and `inline` is mono text whose glyph appears on hover, focus and every touch screen. Default `"text"`.
- `side?`: `"top" | "bottom" | "left" | "right"`. Which side the "Copied!" tooltip opens on. Default `"right"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"md"`.
- `iconOrientation?`: `"center" | "left" | "right"`. Default `"left"`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `rightIcon?`: `ReactNode`
- `tooltipSide?`: `"top" | "bottom" | "left" | "right"`. Which side the tooltip opens on.
- Also accepts `ComponentProps<"button">`.

## Notes

IDs render in the mono family. Every variant announces "Copied" through a polite live region, so the confirmation is not only the tooltip.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/copy-button.tsx:67-119`.
