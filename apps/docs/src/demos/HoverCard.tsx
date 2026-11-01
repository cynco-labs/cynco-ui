import { HoverCard, HoverCardContent, HoverCardTrigger } from "@cynco-labs/ui";

export default function HoverCardDemo() {
	return (
		<HoverCard defaultOpen>
			<HoverCardTrigger className="text-body underline">Nusantara Logistik Bhd</HoverCardTrigger>
			<HoverCardContent align="start">
				<div className="flex flex-col gap-1">
					<div className="text-main text-sm">Nusantara Logistik Bhd</div>
					<div className="text-body">RM 48,210.00 owed · customer since Mar 2024</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
