import { AmountInput, Field, FieldControl, FieldLabel, Kbd } from "@cynco-labs/ui";
import { type ReactNode, useState } from "react";

function Hint({ children }: { children: ReactNode }) {
	return <p className="text-xs text-tertiary-foreground">{children}</p>;
}

function K(k: string) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
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
				<Field className="min-w-0">
					<FieldLabel className="text-xs font-medium text-muted-foreground">Bill amount (controlled)</FieldLabel>
					<FieldControl>
						<AmountInput value={amt} onValueChange={setAmt} currency="MYR" />
					</FieldControl>
					<span className="text-2xs text-tertiary-foreground">
						{"onValueChange → "}
						<code className="font-mono text-2xs font-medium text-foreground">{JSON.stringify(amt)}</code>
					</span>
				</Field>
				<Field className="min-w-0">
					<FieldLabel className="text-xs font-medium text-muted-foreground">Adjustment (negatives allowed)</FieldLabel>
					<FieldControl>
						<AmountInput defaultValue="-500.00" allowNegative currency="MYR" />
					</FieldControl>
				</Field>
				<Field className="min-w-0">
					<FieldLabel className="text-xs font-medium text-muted-foreground">Petty cash count (no prefix)</FieldLabel>
					<FieldControl>
						<AmountInput value={b} onValueChange={setB} placeholder="0.00" />
					</FieldControl>
				</Field>
				<Field className="min-w-0" invalid>
					<FieldLabel className="text-xs font-medium text-muted-foreground">Payment against PO-2026-0088</FieldLabel>
					<FieldControl>
						<AmountInput
							defaultValue="12850.00"
							currency="MYR"
							invalid
							errorMessage="Exceeds the PO balance of RM 12,000.00"
						/>
					</FieldControl>
				</Field>
			</div>
		</div>
	);
}
