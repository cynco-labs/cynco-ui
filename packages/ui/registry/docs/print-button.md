# PrintButton

A "Print" button with a printer icon and a ⌘/Ctrl+P keycap; calls window.print() unless onPrint is given.

```tsx
import { PrintButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { PrintButton } from "@cynco-labs/ui";

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
					? "onPrint called " + n + "× (here instead of window.print())"
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

## Notes

Keyboard: Tab + Enter/Space; ⌘/Ctrl+P when bound (works from inputs too, as a mod shortcut). Hidden in print.

Category: Productivity. Source: `packages/ui/src/productivity/workflow.tsx`.
