# Sheet

A side panel for create/edit flows, sliding in from any edge.

```tsx
import { Sheet } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Button,
	Field,
	FieldControl,
	FieldLabel,
	Input,
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
					<Field>
						<FieldLabel>Company name</FieldLabel>
						<FieldControl>
							<Input placeholder="e.g. Nusantara Logistik Bhd" />
						</FieldControl>
					</Field>
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

## Accessibility

| Key | Does |
| --- | --- |
| ⌘Enter / Ctrl+Enter | Reaches a ShortcutButton in the sheet instead of toggling a Checkbox or Switch inside it. |
| Tab | Reaches the close button in the top corner, which draws a focus-visible outline and is a 40px target on phones. |

SheetTitle and SheetDescription name and describe the panel. The close button is icon-only and carries the sr-only text Close. The sheet is portalled into document.body, or into the container an app names with SheetPortalContainerProvider or the portalContainer prop, so its place in the reading order follows that container.

## Notes

Submit with a ShortcutButton (`metaShortcut="enter"`).

Category: Components · Overlays. Source: `packages/ui/src/base/components/ui/sheet.tsx:31-33`.
