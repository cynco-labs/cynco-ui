# CopyablePre

A code block (or inline span) with a copy button.

```tsx
import { CopyablePre } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CopyablePre, CopyableSpan } from "@cynco-labs/ui";

export default function CopyablePreDemo() {
	return (
		<div className="flex flex-col gap-3 max-w-[460px]">
			<CopyablePre text="npm install @cynco-labs/ui" />
			<CopyableSpan text="am_pk_test_81Hx" />
		</div>
	);
}
```

## Use

Install commands and API keys in onboarding.

## Props

`text`; `CopyableSpan` for inline.

- `text`: `string`

Category: Components · Data display. Source: `packages/ui/src/base/components/general/copyable-pre.tsx`.
