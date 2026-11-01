import { BankLifecycleSpine } from "@cynco-labs/ui";

export default function BankLifecycleSpineDemo() {
	const labels = {
		imported: "Imported: needs a category",
		categorized: "Categorized: ready to post",
		posted: "Posted to GL: ready to reconcile",
		reconciled: "Reconciled",
		excluded: "Excluded",
	};
	return (
		<ul className="flex flex-col gap-2.5">
			{Object.keys(labels).map((s) => (
				<li key={s} className="flex items-center gap-3">
					<BankLifecycleSpine status={s} />
					<span className="text-[13px] text-foreground">{labels[s]}</span>
				</li>
			))}
		</ul>
	);
}
