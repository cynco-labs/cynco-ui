import { Button, type ButtonProps } from "@cynco-labs/ui";
import { CircleIcon, DotsThreeIcon, FilePlusIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export const controls = {
	size: {
		label: "Size",
		options: [
			{ value: "md", label: "Medium" },
			{ value: "sm", label: "Small" },
			{ value: "icon", label: "Icon" },
		],
		default: "md",
	},
	isLoading: { label: "Loading", default: false },
	disabled: { label: "Disabled", default: false },
};

const VARIANTS: { variant: ButtonProps["variant"]; label: string; icon: ReactNode }[] = [
	{ variant: "primary", label: "Create invoice", icon: <FilePlusIcon size={14} /> },
	{ variant: "secondary", label: "Cancel", icon: <XIcon size={14} /> },
	{ variant: "muted", label: "Muted", icon: <CircleIcon size={14} /> },
	{ variant: "skeleton", label: "Skeleton", icon: <DotsThreeIcon size={14} weight="bold" /> },
	{ variant: "destructive", label: "Delete", icon: <TrashIcon size={14} /> },
	{ variant: "dotted", label: "Add item", icon: <PlusIcon size={14} /> },
];

export default function ButtonDemo({
	size = "md",
	isLoading = false,
	disabled = false,
}: {
	size?: "md" | "sm" | "icon";
	isLoading?: boolean;
	disabled?: boolean;
}) {
	const state = { size, isLoading, disabled };
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				{VARIANTS.map(({ variant, label, icon }) =>
					// At `icon` size there is only room for the glyph, so the label becomes the accessible name.
					size === "icon" ? (
						<Button aria-label={label} key={label} variant={variant} {...state}>
							{icon}
						</Button>
					) : (
						<Button key={label} variant={variant} {...state}>
							{variant === "dotted" && icon}
							{label}
						</Button>
					),
				)}
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
