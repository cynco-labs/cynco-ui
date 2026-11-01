# RadioGroup

Base UI radio group; items are small circles filled with `primary`.

```tsx
import { RadioGroup } from "@cynco-labs/ui";
```

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@cynco-labs/ui";

export default function RadioGroupDemo() {
	return (
		<RadioGroup defaultValue="immediate" className="flex flex-col gap-2">
			{["immediate", "end_of_cycle", "never"].map((v, i) => (
				<label key={v} className="flex items-center gap-2 text-body">
					<RadioGroupItem value={v} />
					{["Cash basis", "Accrual basis", "Both"][i]}
				</label>
			))}
		</RadioGroup>
	);
}
```

## Use

Choosing one of 2–5 visible options.

## Props

`value`/`defaultValue`, `onValueChange`; `RadioGroupItem value` children, each wrapped in a label.

## Notes

For options with descriptions use AreaRadioGroupItem.

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/radio-group.tsx`.
