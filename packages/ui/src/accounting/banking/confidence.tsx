"use client";

/**
 * Cynco UI — how sure the categoriser is, in the three shapes the banking
 * views ask for: a tier chip, a ring, or the bare percent.
 */
import { cn, StatusChip, type StatusGlyph, type StatusTone } from "../../base";
import { ConfidenceRing, pctOf, type With } from "./shared";

type Tier = "high" | "medium" | "low";

function tierOf(c: number): Tier {
	return c >= 0.9 ? "high" : c >= 0.7 ? "medium" : "low";
}

const TIER: Record<Tier, { tone: StatusTone; glyph: StatusGlyph; word: string }> = {
	high: { tone: "green", glyph: "check", word: "High" },
	medium: { tone: "amber", glyph: "alert", word: "Medium" },
	low: { tone: "red", glyph: "x", word: "Low" },
};

/**
 * Confidence, rendered. `badge` is the tier chip used where a proposal is
 * listed (≥90 high, 70–89 medium, <70 low); `ring` is the primary ring the
 * review card shows beside a suggestion; `inline` is the bare percent.
 */
export function BankConfidenceMeter({
	confidence,
	variant = "badge",
	showTier = false,
	className,
	...props
}: With<
	{
		confidence: number | null | undefined;
		variant?: "badge" | "ring" | "inline";
		showTier?: boolean;
		className?: string;
	},
	"span"
>) {
	if (confidence == null || !Number.isFinite(confidence)) return null;
	if (variant === "ring") return <ConfidenceRing value={confidence} className={className} {...props} />;
	if (variant === "inline")
		return (
			<span className={cn("shrink-0 text-sm tabular-nums text-primary", className)} {...props}>
				{pctOf(confidence)}
			</span>
		);
	const t = TIER[tierOf(confidence)];
	return (
		<StatusChip
			tone={t.tone}
			glyph={t.glyph}
			className={cn("tabular-nums", className)}
			title={`${t.word} confidence`}
			{...props}
		>
			{showTier ? `${pctOf(confidence)} · ${t.word}` : pctOf(confidence)}
		</StatusChip>
	);
}
