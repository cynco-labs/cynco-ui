# Button

Cynco's one button: six variants on Base UI's Button, 28px tall by default.

```tsx
import { Button } from "@cynco-labs/ui";
```

## Usage

```tsx
import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@cynco-labs/ui";

export const controls = {
	size: {
		label: "Size",
		options: [
			{ value: "default", label: "Default" },
			{ value: "sm", label: "Small" },
			{ value: "mini", label: "Mini" },
		],
		default: "default",
	},
	isLoading: { label: "Loading", default: false },
	disabled: { label: "Disabled", default: false },
};

export default function ButtonDemo({ size = "default", isLoading = false, disabled = false }) {
	const state = { size, isLoading, disabled };
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary" {...state}>
					Create invoice
				</Button>
				<Button variant="secondary" {...state}>
					Cancel
				</Button>
				<Button variant="muted" {...state}>
					Muted
				</Button>
				<Button variant="skeleton" {...state}>
					Skeleton
				</Button>
				<Button variant="destructive" {...state}>
					Delete
				</Button>
				<Button variant="dotted" {...state}>
					<PlusIcon size={14} />
					Add item
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="secondary" size="icon" aria-label="More actions" disabled={disabled}>
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

- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"primary"`.
- `size?`: `"sm" | "default" | "mini" | "icon"`. Default `"default"`.
- `asChild?`: `boolean`. Default `false`.
- `isLoading?`: `boolean`. Default `false`.
- `transition?`: `boolean`. Default `false`.
- `disableActive?`: `boolean`. Default `true`.
- `hide?`: `boolean`. Default `false`.
- `render?`: `ReactElement`
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`. Default `false`.
- Also accepts `ComponentProps<"button">`.

## Notes

Primary = `primary` fill with `primary-foreground` text, a 135° sheen and `shadow-sm`; secondary = `interactive-secondary` with `input` border and `btn-secondary-shadow`. Radius `rounded-lg` (= `radius`). One primary per surface.

Category: Components · Actions. Source: `packages/ui/src/base/components/ui/button.tsx`.
