import { FilterChip } from "@cynco-labs/ui";

export default function FilterChipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<FilterChip label="Status" value="Overdue" onRemove={() => {}} />
			<FilterChip label="Status" value="Active" onRemove={() => {}} />
		</div>
	);
}
