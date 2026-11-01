import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@cynco-labs/ui";

export default function TooltipDemo() {
	return (
		<div className="pt-10 pl-8">
			<Tooltip defaultOpen>
				<TooltipTrigger render={<Button variant="secondary" />}>Hover me</TooltipTrigger>
				<TooltipContent>Due 30 days after the invoice date</TooltipContent>
			</Tooltip>
		</div>
	);
}
