import { ArrowsClockwiseIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { IconTooltipButton } from "@cynco-labs/ui";

export default function IconTooltipButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconTooltipButton tooltip="Edit" icon={<PencilSimpleIcon size={14} />} />
			<IconTooltipButton tooltip="Refresh" icon={<ArrowsClockwiseIcon size={14} />} />
			<IconTooltipButton tooltip="Delete" disabled icon={<TrashIcon size={14} />} />
		</div>
	);
}
