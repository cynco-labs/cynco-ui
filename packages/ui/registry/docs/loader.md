# Loader

A small spinning loader glyph.

```tsx
import { Loader } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Loader } from "@cynco-labs/ui/ai";

export default function LoaderDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Loader size={14} />
			<Loader size={20} />
			<span className="text-body-secondary">Thinking…</span>
		</div>
	);
}
```

## Use

While the assistant is working.

## Props

`size`.

- `size?`: `number`. Default `16`.
- Also accepts `HTMLAttributes<HTMLDivElement>`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/loader.tsx`.
