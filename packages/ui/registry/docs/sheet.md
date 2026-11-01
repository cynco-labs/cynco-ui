# Sheet

A side panel for create/edit flows, sliding in from any edge.

```tsx
import { Sheet } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Button,
	LabelInput,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@cynco-labs/ui";

export default function SheetDemo() {
	return (
		<Sheet defaultOpen modal={false}>
			<SheetContent side="right" className="w-[360px]">
				<SheetHeader>
					<SheetTitle>New customer</SheetTitle>
					<SheetDescription>Add a customer to invoice and track receivables.</SheetDescription>
				</SheetHeader>
				<div className="px-4 flex flex-col gap-2">
					<LabelInput label="Company name" placeholder="e.g. Nusantara Logistik Bhd" />
				</div>
				<SheetFooter>
					<Button variant="primary">Save customer</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
```

## Use

Most create and edit forms in Cynco (new customer, new item).

## Props

`open`/`onOpenChange`; `SheetContent side`, `SheetHeader` › `SheetTitle` + `SheetDescription`, body, `SheetFooter`.

## Notes

Submit with a ShortcutButton (`metaShortcut="enter"`).

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/sheet.tsx`.
