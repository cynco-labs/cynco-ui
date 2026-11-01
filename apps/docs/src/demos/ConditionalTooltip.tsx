import { Button, ConditionalTooltip } from "@cynco-labs/ui";

export default function ConditionalTooltipDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ConditionalTooltip enabled content="Connect a bank account first">
				<Button variant="primary" disabled>
					Publish
				</Button>
			</ConditionalTooltip>
			<ConditionalTooltip enabled={false} content="">
				<Button variant="secondary">Save draft</Button>
			</ConditionalTooltip>
		</div>
	);
}
