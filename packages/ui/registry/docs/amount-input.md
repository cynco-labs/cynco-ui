# AmountInput

The money field accountants type into: accepts plain figures, “1,234.50”, accounting brackets “(500)”, “1.2k” and formulas like “=1200*1.08” or “100+250.50-20”, and commits an exact decimal string.

```tsx
import { AmountInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { AmountInput, Kbd } from "@cynco-labs/ui";

function Hint(p) {
	return <p className="text-xs text-tertiary-foreground">{p.children}</p>;
}

function K(k) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
}

function Field(p) {
	return (
		<label className="flex min-w-0 flex-col gap-1">
			<span className="text-xs font-medium text-muted-foreground">{p.label}</span>
			{p.children}
		</label>
	);
}

export default function AmountInputDemo() {
	const [amt, setAmt] = useState("1296.00");
	const [b, setB] = useState("");
	return (
		<div className="@container flex flex-col gap-4">
			<Hint>
				{"Try: 1,234.50 · (500) · 1.2k · =1200*1.08 · 100+250.50-20 · then "}
				{K("enter")}
				{" or Tab. "}
				{K("esc")}
				{" reverts while editing."}
			</Hint>
			<div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
				<Field label="Bill amount (controlled)">
					<AmountInput value={amt} onValueChange={setAmt} currency="MYR" aria-label="Bill amount" />
					<span className="text-2xs text-tertiary-foreground">
						{"onValueChange → "}
						<code className="text-tiny-id text-foreground">{JSON.stringify(amt)}</code>
					</span>
				</Field>
				<Field label="Adjustment (negatives allowed)">
					<AmountInput
						defaultValue="-500.00"
						allowNegative
						currency="MYR"
						aria-label="Adjustment"
					/>
				</Field>
				<Field label="Petty cash count (no prefix)">
					<AmountInput
						value={b}
						onValueChange={setB}
						placeholder="0.00"
						aria-label="Petty cash count"
					/>
				</Field>
				<Field label="Payment against PO-2026-0088">
					<AmountInput
						defaultValue="12850.00"
						currency="MYR"
						invalid
						errorMessage="Exceeds the PO balance of RM 12,000.00"
						aria-label="Payment amount"
					/>
				</Field>
			</div>
		</div>
	);
}
```

## Use

Anywhere a user enters an amount. While focused it shows exactly what was typed (with a live “= RM 1,296.00” hint for formulas); on blur or Enter it evaluates and shows the formatted, right-aligned figure.

## Props

value / defaultValue (decimal string, "" for empty), onValueChange(value: string), currency? (adds the symbol prefix via InputGroup and formats the hint), allowNegative?, invalid? + errorMessage?, placeholder?, messages? ("below" for forms, "overlay" for grids), onAutoFill? (what “=” then Enter fills), onParseError?, inputClassName?, className (root) and any native input props (aria-*, name, disabled, onBlur…). Forwards its ref to the <input>.

- `value?`: `string`. Controlled value: a decimal string ("1296.00") or "" for empty.
- `defaultValue?`: `string`. Uncontrolled initial value.
- `onValueChange?`: `(value: string) => void`. Fires with the evaluated decimal string when the figure is committed (blur or Enter) and changed.
- `currency?`: `string`. ISO code (e.g. "MYR"): shows the symbol as a prefix and in the live result hint.
- `allowNegative?`: `boolean`. Accept negatives ("-500", "(500)"). Default false. Default `false`.
- `invalid?`: `boolean`. Force the error styling (e.g. server-side validation).
- `errorMessage?`: `ReactNode`. Message shown with `invalid`.
- `messages?`: `"below" | "overlay"`. Where the hint/error appear: in flow under the field (forms) or floating over the next row (grids). Default `"below"`.
- `onAutoFill?`: `() => string | void`. Typing `=` alone then Enter calls this; return a decimal string to commit it (e.g. the figure that balances a journal), or nothing if you've handled it yourself.
- `onParseError?`: `(message: string, text: string) => void`. Called when a commit is refused because the text isn't a valid amount.
- `inputClassName?`: `string`. Classes for the <input> itself (`className` goes on the root).
- Also accepts `ComponentProps<"input">`.

## Notes

Maths via parseAmount / toSen (BigInt, half-up), so 0.1 + 0.2 is 0.30. Fills its container's width; negatives display bracketed in text-error-text.

Category: Productivity. Source: `packages/ui/src/productivity/entry.tsx`.
