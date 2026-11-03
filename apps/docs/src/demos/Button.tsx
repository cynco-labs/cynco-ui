import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@cynco-labs/ui";

export const controls = {
	size: {
		label: "Size",
		options: [
			{ value: "default", label: "Default" },
			{ value: "sm", label: "Small" },
			{ value: "mini", label: "Mini" },
		],
		default: "default",
	},
	isLoading: { label: "Loading", default: false },
	disabled: { label: "Disabled", default: false },
};

export default function ButtonDemo({
	size = "default",
	isLoading = false,
	disabled = false,
}: {
	size?: "default" | "sm" | "mini" | "icon";
	isLoading?: boolean;
	disabled?: boolean;
}) {
	const state = { size, isLoading, disabled };
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary" {...state}>
					Create invoice
				</Button>
				<Button variant="secondary" {...state}>
					Cancel
				</Button>
				<Button variant="muted" {...state}>
					Muted
				</Button>
				<Button variant="skeleton" {...state}>
					Skeleton
				</Button>
				<Button variant="destructive" {...state}>
					Delete
				</Button>
				<Button variant="dotted" {...state}>
					<PlusIcon size={14} />
					Add item
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="secondary" size="icon" aria-label="More actions" disabled={disabled}>
					<DotsThreeIcon size={14} weight="bold" />
				</Button>
				<Button variant="primary" isLoading>
					Saving
				</Button>
				<Button variant="secondary" disabled>
					Disabled
				</Button>
			</div>
		</div>
	);
}
