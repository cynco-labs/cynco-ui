import { BankConfidenceMeter } from "@cynco-labs/ui";

export default function BankConfidenceMeterDemo() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<span className="w-16 text-tiny text-tertiary-foreground">Badge</span>
				<BankConfidenceMeter confidence={0.96} />
				<BankConfidenceMeter confidence={0.78} />
				<BankConfidenceMeter confidence={0.52} />
				<BankConfidenceMeter confidence={0.93} showTier />
				<BankConfidenceMeter confidence={0.64} showTier />
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="w-16 text-tiny text-tertiary-foreground">Ring</span>
				<BankConfidenceMeter confidence={0.94} variant="ring" />
				<BankConfidenceMeter confidence={0.72} variant="ring" />
				<BankConfidenceMeter confidence={0.41} variant="ring" />
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="w-16 text-tiny text-tertiary-foreground">Inline</span>
				<BankConfidenceMeter confidence={0.88} variant="inline" />
			</div>
		</div>
	);
}
