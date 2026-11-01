import { Button, Popover, PopoverContent, PopoverTrigger } from "@cynco-labs/ui";

export default function PopoverDemo() {
	return (
		<Popover defaultOpen>
			<PopoverTrigger render={<Button variant="secondary" />}>Payment details</PopoverTrigger>
			<PopoverContent align="start" className="w-64">
				<div className="flex flex-col gap-1.5 p-1">
					<div className="text-main text-sm">Balance due</div>
					<div className="text-body">RM 12,720.00 by 27 Nov 2026</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
