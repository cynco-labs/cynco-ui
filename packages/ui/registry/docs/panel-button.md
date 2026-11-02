# PanelButton

A large, tactile tile button with screws and seams; the selected tile takes a primary border and a check mark in its corner.

```tsx
import { PanelButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { CoinsIcon, CreditCardIcon, LightningIcon } from "@phosphor-icons/react";
import { PanelButton } from "@cynco-labs/ui";

export default function PanelButtonDemo() {
	const [s, setS] = useState(0);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<PanelButton
				isSelected={s === 0}
				onClick={() => {
					setS(0);
				}}
				icon={<CoinsIcon size={20} weight="duotone" />}
				aria-label="Pay by bank transfer"
			/>
			<PanelButton
				isSelected={s === 1}
				onClick={() => {
					setS(1);
				}}
				icon={<LightningIcon size={20} weight="duotone" />}
				aria-label="Pay by DuitNow"
			/>
			<PanelButton
				isSelected={s === 2}
				onClick={() => {
					setS(2);
				}}
				icon={<CreditCardIcon size={20} weight="duotone" />}
				aria-label="Pay by card"
			/>
		</div>
	);
}
```

## Use

Picking one of a few big options in onboarding (business type, tax registration).

## Props

`isSelected`, `onClick`, `icon` (Phosphor duotone, 20px), and an `aria-label` (the tile is icon-only).

- `isSelected`: `boolean`
- `onClick`: `() => void`
- `icon`: `ReactNode`
- Also accepts `ComponentProps<"button">`.

## Notes

Selection is exposed as `aria-pressed` and shown by the corner check mark, not by colour alone. The mark sits slightly outside the tile, so leave a few pixels of room around it.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/panel-button.tsx`.
