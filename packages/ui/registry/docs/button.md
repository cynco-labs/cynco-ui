# Button

Cynco's one button: six variants on Base UI's Button, 28px tall by default.

```tsx
import { Button } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Button, type ButtonProps } from "@cynco-labs/ui";
import { CircleIcon, DotsThreeIcon, FilePlusIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export const controls = {
	size: {
		label: "Size",
		options: [
			{ value: "md", label: "Medium" },
			{ value: "sm", label: "Small" },
			{ value: "icon", label: "Icon" },
		],
		default: "md",
	},
	isLoading: { label: "Loading", default: false },
	disabled: { label: "Disabled", default: false },
};

const VARIANTS: { variant: ButtonProps["variant"]; label: string; icon: ReactNode }[] = [
	{ variant: "primary", label: "Create invoice", icon: <FilePlusIcon size={14} /> },
	{ variant: "secondary", label: "Cancel", icon: <XIcon size={14} /> },
	{ variant: "muted", label: "Muted", icon: <CircleIcon size={14} /> },
	{ variant: "skeleton", label: "Skeleton", icon: <DotsThreeIcon size={14} weight="bold" /> },
	{ variant: "destructive", label: "Delete", icon: <TrashIcon size={14} /> },
	{ variant: "dotted", label: "Add item", icon: <PlusIcon size={14} /> },
];

export default function ButtonDemo({
	size = "md",
	isLoading = false,
	disabled = false,
}: {
	size?: "md" | "sm" | "icon";
	isLoading?: boolean;
	disabled?: boolean;
}) {
	const state = { size, isLoading, disabled };
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				{VARIANTS.map(({ variant, label, icon }) =>
					// At `icon` size there is only room for the glyph, so the label becomes the accessible name.
					size === "icon" ? (
						<Button aria-label={label} key={label} variant={variant} {...state}>
							{icon}
						</Button>
					) : (
						<Button key={label} variant={variant} {...state}>
							{variant === "dotted" && icon}
							{label}
						</Button>
					),
				)}
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

Children (label, optional Phosphor icon at 14px). Optional `isLoading` (shows `SmallSpinner`, keeps width), `disabled`, `size` (`md` 28px · `sm`/`icon` 24px), `render`/`asChild` to render as a link.

- `asChild?`: `boolean`. Radix compatibility: render the single child element instead of a `<button>`. Default `false`.
- `isLoading?`: `boolean`. Swaps the label for a spinner and disables the button, while the label stays its accessible name. Default `false`.
- `render?`: `ReactElement`. The element to render instead of a `<button>` (Base UI).
- `focusableWhenDisabled?`: `boolean`. Keep the button in the tab order while disabled (Base UI). Set automatically while `isLoading`. Default `false`.
- `variant?`: `"primary" | "secondary" | "skeleton" | "muted" | "destructive" | "dotted"`. Default `"primary"`.
- `size?`: `"sm" | "md" | "icon"`. Default `"md"`.
- Also accepts `ComponentProps<"button">`.

## Accessibility

| Key | Does |
| --- | --- |
| Enter, Space | Activates the button. |
| Tab | Reaches the button even while it is loading, because a loading button is kept focusable instead of natively disabled. |

Nothing in the component supplies an accessible name, so the label is whatever you put inside it and an icon-only button needs an aria-label of your own. While isLoading, the button carries aria-busy, is disabled, and stays focusable with aria-disabled rather than the native disabled attribute. The label is only faded to transparent behind the spinner, so it still reads as the button's name.

## Notes

Primary = `primary` fill with `primary-foreground` text, a 135° sheen and `shadow-sm`; secondary = `interactive-secondary` with `input` border and `btn-secondary-shadow`. Radius `rounded-lg` (= `radius`). One primary per surface.

Category: Components · Actions. Source: `packages/ui/src/base/components/ui/button.tsx:73-121`.
