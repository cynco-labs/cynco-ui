import { InfoTooltip } from "@cynco-labs/ui";

export default function InfoTooltipDemo() {
	return (
		<div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
			Rounding adjustment
			<InfoTooltip>Cash totals round to the nearest 5 sen (BNM rounding).</InfoTooltip>
		</div>
	);
}
