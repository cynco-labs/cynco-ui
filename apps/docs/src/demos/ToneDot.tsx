import { ToneDot } from "@cynco-labs/ui";

const tones = ["green", "blue", "amber", "orange", "red", "purple", "neutral"];

export default function ToneDotDemo() {
	return (
		<div className="flex flex-col gap-2 text-sm text-foreground">
			<div className="flex flex-wrap items-center gap-2">
				{tones.map((t) => (
					<span key={t} className="inline-flex items-center gap-1.5">
						<ToneDot tone={t} />
						{t}
					</span>
				))}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{tones.map((t) => (
					<span key={t} className="inline-flex items-center gap-1.5">
						<ToneDot tone={t} square />
						{t}
					</span>
				))}
			</div>
		</div>
	);
}
