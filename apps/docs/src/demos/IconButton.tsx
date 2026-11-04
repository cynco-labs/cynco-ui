import { IconButton } from "@cynco-labs/ui";
import { ArrowsClockwiseIcon, CaretDownIcon, FunnelSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

export default function IconButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconButton variant="primary" icon={<PlusIcon size={14} weight="bold" />}>
				New invoice
			</IconButton>
			<IconButton variant="secondary" icon={<FunnelSimpleIcon size={14} />}>
				Filter
			</IconButton>
			<IconButton variant="secondary" rightIcon={<CaretDownIcon size={12} />}>
				Actions
			</IconButton>
			<IconButton
				variant="secondary"
				iconOrientation="center"
				tooltip="Refresh"
				icon={<ArrowsClockwiseIcon size={14} />}
			/>
			<IconButton variant="skeleton" icon={<TrashIcon size={14} />} aria-label="Delete" />
			<IconButton variant="destructive" icon={<TrashIcon size={14} />}>
				Remove
			</IconButton>
		</div>
	);
}
