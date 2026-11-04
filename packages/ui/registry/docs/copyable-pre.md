# CopyablePre

A code block with a copy button pinned to its corner.

```tsx
import { CopyablePre } from "@cynco-labs/ui";
```

## Usage

```tsx
import { CopyablePre } from "@cynco-labs/ui";

export default function CopyablePreDemo() {
	return (
		<div className="max-w-[460px]">
			<CopyablePre text={'pnpm add @cynco-labs/ui\nimport { DataTable } from "@cynco-labs/ui";'} />
		</div>
	);
}
```

## Use

Install commands and multi-line snippets. For a single value inline, use `CopyButton`.

## Props

`text`, plus any div props.

- `text`: `string`
- Also accepts `ComponentProps<"div">`.

Category: Components · Data display. Source: `packages/ui/src/base/components/general/copyable-pre.tsx:7-21`.
