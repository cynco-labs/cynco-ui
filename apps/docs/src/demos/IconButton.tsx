import { CaretDownIcon, FunnelSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { IconButton } from "@cynco-labs/ui";

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
			<IconButton variant="skeleton" icon={<TrashIcon size={14} />} aria-label="Delete" />
			<IconButton variant="destructive" icon={<TrashIcon size={14} />}>
				Remove
			</IconButton>
		</div>
	);
}
