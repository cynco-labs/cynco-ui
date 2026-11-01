# IconButton

A Button with a leading or trailing icon slot, sized for Cynco's 14px Phosphor icons.

```tsx
import { IconButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CaretDownIcon, FunnelSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { IconButton } from "@cynco-labs/ui";

export default function IconButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconButton variant="primary" icon={<PlusIcon size={14} weight="bold" />}>
				New invoice
			</IconButton>
			<IconButton variant="secondary" icon={<FunnelSimpleIcon size={14} />}>
				Filter
			</IconButton>
			<IconButton variant="secondary" rightIcon={<CaretDownIcon size={12} />}>
				Actions
			</IconButton>
			<IconButton variant="skeleton" icon={<TrashIcon size={14} />} />
			<IconButton variant="destructive" icon={<TrashIcon size={14} />}>
				Remove
			</IconButton>
		</div>
	);
}
```

## Use

Any action whose icon helps scanning: "New invoice", "Filter". Icon-only for compact toolbars (pair with a tooltip).

## Props

All Button props plus `icon`, `rightIcon` and `iconOrientation` (`left` · `center` · `right`).

## Notes

Use `skeleton` for icon-only actions inside rows.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/icon-button.tsx`.
