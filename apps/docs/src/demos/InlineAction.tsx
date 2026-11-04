import { InlineAction } from "@cynco-labs/ui";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";

export default function InlineActionDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<InlineAction icon={<PlusIcon size={12} weight="bold" />}>Add line</InlineAction>
			<InlineAction icon={<PencilSimpleIcon size={12} />}>Edit</InlineAction>
		</div>
	);
}
