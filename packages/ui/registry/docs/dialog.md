# Dialog

Centered modal on `overlay-dialog` with `overlay-dialog-shadow`.

```tsx
import { Dialog } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@cynco-labs/ui";

export default function DialogDemo() {
	return (
		<Dialog defaultOpen modal={false}>
			<DialogContent className="max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Void invoice</DialogTitle>
					<DialogDescription>
						INV-2026-0142 will be reversed in the ledger and marked Void. This cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="secondary">Cancel</Button>
					<Button variant="destructive">Void invoice</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
```

## Use

Confirmations and short, blocking decisions. Longer forms go in a Sheet.

## Props

`open`/`onOpenChange`; `DialogContent` (`showCloseButton`), `DialogHeader` › `DialogTitle` + `DialogDescription`, `DialogFooter` with secondary then primary/destructive buttons.

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/dialog.tsx`.
