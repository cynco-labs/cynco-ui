import { Badge } from "@cynco-labs/ui";

export default function BadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Badge>Default</Badge>
			<Badge variant="muted">Muted</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="muted" size="sm">
				Small
			</Badge>
		</div>
	);
}
