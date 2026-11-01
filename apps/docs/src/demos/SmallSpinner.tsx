import { SmallSpinner } from "@cynco-labs/ui";

export default function SmallSpinnerDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<SmallSpinner size={12} />
			<SmallSpinner size={16} />
			<SmallSpinner size={20} />
		</div>
	);
}
