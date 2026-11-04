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
				<label key={v} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
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

## Accessibility

| Key | Does |
| --- | --- |
| Tab | Moves focus to a radio, which draws a 2px focus-visible outline. |

Neither the group nor its items carry a label, so you supply the group's name and each option's label. The checked state belongs to the Base UI radio and is drawn by a small filled indicator inside the control.

## Notes

For options with descriptions use AreaRadioGroupItem.

Category: Components · Selection. Source: `packages/ui/src/base/components/ui/radio-group.tsx:6-8`.
