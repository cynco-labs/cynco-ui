# CopyButton

Copy-to-clipboard buttons for IDs and keys, with a "Copied!" tooltip.

```tsx
import { CopyButton } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CopyButton, CopyIconButton, MiniCopyButton } from "@cynco-labs/ui";

export default function CopyButtonDemo() {
	return (
		<div className="flex flex-col gap-3 items-start">
			<div className="flex flex-wrap items-center gap-2">
				<CopyButton text="INV-2026-0142">INV-2026-0142</CopyButton>
				<CopyIconButton text="cy_sk_test_7f3a91" />
			</div>
			<MiniCopyButton text="1200-001" displayText="1200-001" />
		</div>
	);
}
```

## Use

`CopyButton` for an ID shown as a chip, `CopyIconButton` for an icon-only copy next to text, `MiniCopyButton` for inline mono IDs in tables (icon reveals on hover).

## Props

`text` to copy; `displayText` (Mini) to shorten what is shown; `side` for the tooltip.

## Notes

IDs render in the mono family.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/copy-button.tsx`.
