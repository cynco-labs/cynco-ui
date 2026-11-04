import { BankCloseStateChip } from "@cynco-labs/ui";

const STATES = ["closed", "ready", "needs_work", "no_statement", "covered", "in_progress", "future"] as const;

export default function BankCloseStateChipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{STATES.map((s) => (
				<BankCloseStateChip key={s} state={s} />
			))}
		</div>
	);
}
