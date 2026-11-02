# Select

Base UI select with a 28px trigger and an `overlay` popup with check indicators.

```tsx
import { Select } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cynco-labs/ui";

export default function SelectDemo() {
	return (
		<div className="max-w-[240px]">
			<Select
				defaultValue="month"
				defaultOpen
				items={[
					{ label: "Monthly", value: "month" },
					{ label: "Quarterly", value: "quarter" },
					{ label: "Yearly", value: "year" },
				]}
			>
				<SelectTrigger className="w-full" aria-label="Billing period">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="month">Monthly</SelectItem>
					<SelectItem value="quarter">Quarterly</SelectItem>
					<SelectItem value="year">Yearly</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
```

## Use

Choosing one of a short, known list (payment terms, currencies). Use SearchableSelect past ~8 options.

## Props

`value`/`defaultValue`, `onValueChange`, `items` (labels for the value display); children `SelectTrigger` › `SelectValue`, `SelectContent` › `SelectItem`.

- `defaultValue?`: `string`. The uncontrolled value of the select when it's initially rendered. To render a controlled select, use the `value` prop instead.
- `value?`: `string | null`. The value of the select. Use when controlled. `null` means nothing is selected (the placeholder shows) while staying controlled.
- `items?`: `Record<string, string> | ReadonlyArray<{ label: string; value: string }>`. Data structure of the items rendered in the select popup. When specified, `<Select.Value>` renders the label of the selected item instead of the raw value.
- `onValueChange?`: `(value: string | null) => void`. `null` when the selection is cleared.
- `onOpenChange?`: `(open: boolean) => void`
- Also accepts `SelectPrimitive.Root.Props<string>`.

## Notes

Trigger uses `input-state-open`. `SelectItem indicator={false}` drops the checkmark.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/select.tsx`.
