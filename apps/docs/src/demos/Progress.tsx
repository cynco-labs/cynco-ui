import { Progress } from "@cynco-labs/ui";

export default function ProgressDemo() {
	return (
		<div className="max-w-[360px]">
			<Progress value={64} aria-label="Import progress" />
		</div>
	);
}
