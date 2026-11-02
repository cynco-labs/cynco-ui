# LongInput

A monospace-friendly textarea on `input-background` for JSON and long values.

```tsx
import { LongInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { LongInput } from "@cynco-labs/ui";

export default function LongInputDemo() {
	return (
		<div className="max-w-[420px]">
			<LongInput aria-label="Custom fields (JSON)" defaultValue={'{\n  "branch": "Shah Alam",\n  "costCentre": "OPS-02"\n}'} />
		</div>
	);
}
```

## Use

Metadata editors and pasted config.

## Props

Native textarea props.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/long-input.tsx`.
