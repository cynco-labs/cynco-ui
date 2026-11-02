# SheetAccordion

Accordion sections styled for sheets: title, description, optional separators.

```tsx
import { SheetAccordion } from "@cynco-labs/ui";
```

## Usage

```tsx
import { SheetAccordion, SheetAccordionItem } from "@cynco-labs/ui";

export default function SheetAccordionDemo() {
	return (
		<div className="max-w-[420px] rounded-lg border bg-background">
			<SheetAccordion type="multiple" defaultValue={["payment"]} withSeparator>
				<SheetAccordionItem
					value="payment"
					title="Payment"
					description="Terms and how the customer pays"
				>
					<div className="text-body">Net 30 · DuitNow or bank transfer</div>
				</SheetAccordionItem>
				<SheetAccordionItem value="tax" title="Tax">
					<div className="text-body">SST 8% · TIN C10987654320</div>
				</SheetAccordionItem>
			</SheetAccordion>
		</div>
	);
}
```

## Use

Grouping long create/edit sheets into collapsible sections.

## Props

`type`, `defaultValue`, `withSeparator`; `SheetAccordionItem value title description`.

- `children`: `ReactNode`
- `type?`: `"single" | "multiple"`. Default `"single"`.
- `defaultValue?`: `string | string[]`
- `withSeparator?`: `boolean`. Default `true`.
- `collapsible?`: `boolean`. Default `true`.
- Also accepts `AccordionPrimitive.Root.Props<string>`.

Category: Components · Navigation. Source: `packages/ui/src/base/components/general/sheet-accordion.tsx`.
