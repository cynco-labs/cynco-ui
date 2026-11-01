import { ToolbarButton } from "@cynco-labs/ui";

export default function ToolbarButtonDemo() {
	return (
		<div className="max-w-[420px] flex flex-col rounded-lg border bg-table-surface">
			{["Pro", "Enterprise"].map((n) => (
				<div
					key={n}
					className="flex items-center justify-between h-10 px-3 border-b border-table-row-divider last:border-0 text-body"
				>
					{n}
					<ToolbarButton aria-label="Row actions" />
				</div>
			))}
		</div>
	);
}
