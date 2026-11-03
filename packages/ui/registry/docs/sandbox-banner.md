# SandboxBanner

The blue tab hanging from the top edge that marks sandbox mode.

```tsx
import { SandboxBanner } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SandboxBanner, SandboxBannerAction } from "@cynco-labs/ui";

export default function SandboxBannerDemo() {
	return (
		<div className="relative h-10">
			<SandboxBanner>
				<SandboxBannerAction>Switch to live</SandboxBannerAction>
			</SandboxBanner>
		</div>
	);
}
```

## Use

Shown on every page while working in a sandbox or demo company.

## Props

Optional `label`, `icon`, `color`; `SandboxBannerAction` children.

- `color?`: `string`. Background colour, e.g. to tell environments apart.
- `label?`: `string`. Default `"Sandbox"`.
- `icon?`: `ReactNode`
- Also accepts `ComponentProps<"div">`.

## Notes

Fill is `sandbox`; text white.

Category: Components · Layout. Source: `packages/ui/src/base/components/general/sandbox-banner.tsx`.
