# PrintButton

A "Print" button with a printer icon and a ⌘/Ctrl+P keycap; calls window.print() unless onPrint is given.

```tsx
import { PrintButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { PrintButton } from "@cynco-labs/ui";
import { useState } from "react";

export default function PrintButtonDemo() {
	const [n, setN] = useState(0);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<PrintButton
					onPrint={() => {
						setN((x) => x + 1);
					}}
				/>
				<PrintButton
					variant="primary"
					onPrint={() => {
						setN((x) => x + 1);
					}}
				>
					Download PDF
				</PrintButton>
				<PrintButton
					showShortcut={false}
					onPrint={() => {
						setN((x) => x + 1);
					}}
				>
					Print receipt
				</PrintButton>
			</div>
			<p className="text-xs text-tertiary-foreground" role="status">
				{n
					? `onPrint called ${n}× (here instead of window.print())`
					: "Try: click, or press Ctrl/⌘+P — with onPrint set, the shortcut runs it instead of the browser dialog"}
			</p>
		</div>
	);
}
```

## Use

Next to any Cynco document (TaxInvoiceDocument, ReceiptDocument, ProfitAndLossReport…). Pass onPrint to route printing elsewhere (e.g. download the server-rendered PDF).

## Props

onPrint?, bindShortcut? (default: true only when onPrint is set — otherwise the browser's own ⌘/Ctrl+P already prints the print layout), showShortcut (default true), children (label, default "Print"), plus Button props (variant — default secondary, size, disabled, className…).

- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"secondary"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"md"`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name.
- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`.
- `onPrint?`: `() => void`. Replace window.print() — e.g. download a server-rendered PDF.
- `bindShortcut?`: `boolean`. Handle ⌘/Ctrl+P on this page. Default: only when `onPrint` is given (otherwise the browser's own print already uses the print layout).
- `showShortcut?`: `boolean`. Show the ⌘/Ctrl+P keycap. Default true.
- Also accepts `ComponentProps<"button">`.

## Notes

Keyboard: Tab + Enter/Space; ⌘/Ctrl+P when bound (works from inputs too, as a mod shortcut). Hidden in print.

Category: Productivity. Source: `packages/ui/src/productivity/workflow/print-button.tsx:37-69`.
