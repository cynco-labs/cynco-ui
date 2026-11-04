import { type BankFeedStatus, BankLifecycleSpine } from "@cynco-labs/ui";

const STEPS: [BankFeedStatus, string][] = [
	["imported", "Imported: needs a category"],
	["categorized", "Categorized: ready to post"],
	["posted", "Posted to GL: ready to reconcile"],
	["reconciled", "Reconciled"],
	["excluded", "Excluded"],
];

export default function BankLifecycleSpineDemo() {
	return (
		<ul className="flex flex-col gap-2.5">
			{STEPS.map(([status, label]) => (
				<li key={status} className="flex items-center gap-3">
					<BankLifecycleSpine status={status} />
					<span className="text-sm text-foreground">{label}</span>
				</li>
			))}
		</ul>
	);
}
