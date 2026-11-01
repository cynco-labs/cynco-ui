import { DotsThreeIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@cynco-labs/ui";

export default function ButtonDemo() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary">Create invoice</Button>
				<Button variant="secondary">Cancel</Button>
				<Button variant="muted">Muted</Button>
				<Button variant="skeleton">Skeleton</Button>
				<Button variant="destructive">Delete</Button>
				<Button variant="dotted">
					<PlusIcon size={14} />
					Add item
				</Button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button variant="primary" size="sm">
					Small
				</Button>
				<Button variant="secondary" size="mini">
					Mini
				</Button>
				<Button variant="secondary" size="icon">
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
