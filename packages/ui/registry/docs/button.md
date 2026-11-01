# Button

Cynco's one button: six variants on Base UI's Button, 28px tall by default.

```tsx
import { Button } from "@cynco-labs/ui";
```

## Usage

```tsx
import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@cynco-labs/ui";

export default function ButtonDemo() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary">Create invoice</Button>
				<Button variant="secondary">Cancel</Button>
				<Button variant="muted">Muted</Button>
				<Button variant="skeleton">Skeleton</Button>
				<Button variant="destructive">Delete</Button>
				<Button variant="dotted">
					<PlusIcon size={14} />
					Add item
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary" size="sm">
					Small
				</Button>
				<Button variant="secondary" size="mini">
					Mini
				</Button>
				<Button variant="secondary" size="icon">
					<DotsThreeIcon size={14} weight="bold" />
				</Button>
				<Button variant="primary" isLoading>
					Saving
				</Button>
				<Button variant="secondary" disabled>
					Disabled
				</Button>
			</div>
		</div>
	);
}
```

## Use

Use `primary` for the single main action of a view or sheet, `secondary` for everything else, `muted` and `skeleton` for quiet toolbar actions, `destructive` only for irreversible deletes, `dotted` for "add another" slots.

## Props

Children (label, optional Phosphor icon at 14px). Optional `isLoading` (shows `SmallSpinner`, keeps width), `disabled`, `size` (`default` 28px · `sm`/`mini`/`icon` 24px), `render`/`asChild` to render as a link.

## Notes

Primary = `primary` fill with `primary-foreground` text, a 135° sheen and `shadow-sm`; secondary = `interactive-secondary` with `input` border and `btn-secondary-shadow`. Radius `rounded-lg` (= `radius`). One primary per surface.

Category: Components · Actions. Source: `packages/ui/src/base/components/ui/button.tsx`.
