import { BankBalanceEquation } from "@cynco-labs/ui";
import type { ReactNode } from "react";

export default function BankBalanceEquationDemo() {
	const sec = (t: ReactNode) => (
		<div className="text-tiny uppercase tracking-[0.04em] text-tertiary-foreground">{t}</div>
	);
	return (
		<div className="flex flex-col gap-4">
			{sec("Ties")}
			<BankBalanceEquation
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 184520.4 },
					{ label: "Money in", amount: 96310.0, op: "plus", hint: "52 lines" },
					{ label: "Money out", amount: 72845.15, op: "minus", hint: "131 lines" },
				]}
				check={{ label: "Statement closing", amount: 207985.25 }}
				tiesLabel="Ties to the statement"
			/>
			{sec("Off")}
			<BankBalanceEquation
				size="sm"
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 42100 },
					{ label: "Money in", amount: 18250, op: "plus" },
					{ label: "Money out", amount: 20412.6, op: "minus" },
				]}
				check={{ label: "Statement closing", amount: 39887.4 }}
			/>
			{sec("Pending")}
			<BankBalanceEquation
				size="sm"
				resultLabel="Closing"
				terms={[
					{ label: "Opening", amount: 42100 },
					{ label: "Money in", amount: undefined, op: "plus" },
					{ label: "Money out", amount: undefined, op: "minus" },
				]}
				check={{ label: "Statement closing", amount: undefined }}
			/>
		</div>
	);
}
