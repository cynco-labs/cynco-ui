# PanelButton

A large, tactile tile button with screws and seams, selected state glowing in the primary colour.

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
			/>
			<PanelButton
				isSelected={s === 1}
				onClick={() => {
					setS(1);
				}}
				icon={<LightningIcon size={20} weight="duotone" />}
			/>
			<PanelButton
				isSelected={s === 2}
				onClick={() => {
					setS(2);
				}}
				icon={<CreditCardIcon size={20} weight="duotone" />}
			/>
		</div>
	);
}
```

## Use

Picking one of a few big options in onboarding (business type, tax registration).

## Props

`isSelected`, `onClick`, `icon` (Phosphor duotone, 20px).

## Notes

Selected tile uses the `panel-shadow` glow (primary-tinted); unselected tiles are neutral. Styled for the light theme.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/panel-button.tsx`.
