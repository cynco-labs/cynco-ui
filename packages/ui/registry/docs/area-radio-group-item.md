# AreaRadioGroupItem

A radio option with a label and description line.

```tsx
import { AreaRadioGroupItem } from "@cynco-labs/ui";
```

## Usage

```tsx
import { AreaRadioGroupItem, RadioGroup } from "@cynco-labs/ui";

export default function AreaRadioGroupItemDemo() {
	return (
		<RadioGroup defaultValue="exclusive" className="flex flex-col gap-2 max-w-[440px]">
			<AreaRadioGroupItem value="exclusive" label="Tax exclusive" description="SST is added on top of each line amount." />
			<AreaRadioGroupItem value="inclusive" label="Tax inclusive" description="Line amounts already include SST." />
			<AreaRadioGroupItem
				value="exempt"
				label="Exempt"
				description="Coming soon"
				disabled
				disabledReason="Your business is SST-registered"
			/>
		</RadioGroup>
	);
}
```

## Use

Tax treatment and behaviour choices in sheets.

## Props

Inside RadioGroup: `value`, `label`, optional `description`, `disabled` + `disabledReason`.

- `value`: `string`
- `label`: `string`
- `description?`: `string`
- `disabled?`: `boolean`. Default `false`.
- `disabledReason?`: `string`
- Also accepts `ComponentProps<"label">`.

Category: Components · Selection. Source: `packages/ui/src/base/components/general/area-radio-group-item.tsx:17-71`.
