import { useState, type ReactNode } from "react";
import { AmountInput, Kbd } from "@cynco-labs/ui";

function Hint({ children }: { children: ReactNode }) {
	return <p className="text-xs text-tertiary-foreground">{children}</p>;
}

function K(k: string) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="flex min-w-0 flex-col gap-1">
			<span className="text-xs font-medium text-muted-foreground">{label}</span>
			{children}
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
