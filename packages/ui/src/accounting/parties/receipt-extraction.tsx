"use client";

/**
 * Cynco UI — every state of a Cynco AI extraction on a bill document.
 */
import { ArrowClockwiseIcon, ShieldCheckIcon, SparkleIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { Button, cn, IconButton, LiveStatus, SmallSpinner, StatusChipIcon } from "../../base";
import { ActionBar } from "../../lib/shared";
import { confidenceLabel } from "./shared";

export type ExtractionStage = "queued" | "reading" | "extracting" | "checking" | "applying" | "done" | "failed";
export type ExtractionView =
	| { kind: "running"; stage: ExtractionStage; detail?: string | null; slow?: boolean }
	| { kind: "timed-out" }
	| { kind: "failed"; message?: string | null; retryable?: boolean }
	| { kind: "done"; confidence: number | null };

const EXTRACTION_STEPS: Array<{ stage: ExtractionStage; label: string }> = [
	{ stage: "reading", label: "Reading" },
	{ stage: "extracting", label: "Extracting" },
	{ stage: "checking", label: "Checking" },
	{ stage: "applying", label: "Applying" },
];
const STAGE_ORDER: ExtractionStage[] = ["queued", "reading", "extracting", "checking", "applying", "done"];
const FALLBACK_FAILURE =
	"Could not extract data from this document. You can fill in the details manually or try again.";
const TIMED_OUT = "This is taking longer than usual. It may still finish in the background.";

export type ReceiptExtractionProgressProps = React.ComponentProps<"div"> & {
	view: ExtractionView | null;
	hasExtractedData?: boolean;
	/** The user chose to fill the form while extraction runs. */
	manualEntry?: boolean;
	isReExtracting?: boolean;
	onReview?: () => void;
	onReExtract?: () => void;
	onEnterManually?: () => void;
	onCheckStatus?: () => void;
};

export function ReceiptExtractionProgress({
	view,
	hasExtractedData = true,
	manualEntry = false,
	isReExtracting,
	onReview,
	onReExtract,
	onEnterManually,
	onCheckStatus,
	className,
	...props
}: ReceiptExtractionProgressProps) {
	if (!view) return null;
	const enterManually = !manualEntry;
	const activeStep =
		view.kind === "running"
			? EXTRACTION_STEPS.find((s) => s.stage === (view.stage === "failed" ? "reading" : view.stage))
			: undefined;
	const announcement =
		view.kind === "running"
			? `Reading your bill${activeStep ? `: ${activeStep.label}` : ""}`
			: view.kind === "done"
				? `Read by Cynco AI${view.confidence !== null ? `, ${view.confidence}% ${confidenceLabel(view.confidence)}` : ""}`
				: view.kind === "timed-out"
					? TIMED_OUT
					: "";
	return (
		<div
			data-slot="extraction-progress"
			className={cn("@container min-w-0 rounded-lg border border-border bg-card px-3 py-2.5", className)}
			{...props}
		>
			<LiveStatus>{announcement}</LiveStatus>
			{view.kind === "running" && (
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
						<div className="min-w-0">
							<p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
								<SparkleIcon size={13} weight="fill" className="text-primary" aria-hidden="true" />
								Reading your bill
							</p>
							<p className="text-xs text-tertiary-foreground">
								{view.stage === "done"
									? "Done"
									: view.stage === "failed"
										? "Ran into a problem, trying again"
										: view.slow
											? "Taking longer than usual, still working"
											: "Usually under a minute"}
							</p>
						</div>
						{enterManually && (
							<Button variant="skeleton" size="sm" onClick={onEnterManually} className="shrink-0 text-primary">
								Fill in details myself
							</Button>
						)}
					</div>
					<ol className="flex flex-col">
						{EXTRACTION_STEPS.map((step, i) => {
							const at = STAGE_ORDER.indexOf(view.stage === "failed" ? "reading" : view.stage);
							const own = STAGE_ORDER.indexOf(step.stage);
							const status = own < at ? "complete" : own === at ? "active" : "pending";
							const last = i === EXTRACTION_STEPS.length - 1;
							return (
								<li
									key={step.stage}
									aria-current={status === "active" ? "step" : undefined}
									className={cn("flex gap-2.5", status === "pending" && "text-tertiary-foreground [&_*]:text-inherit")}
								>
									<div className="flex w-3.5 shrink-0 flex-col items-center">
										<div className="flex h-4 items-center">
											{status === "complete" ? (
												<StatusChipIcon tone="green" glyph="check" />
											) : status === "active" ? (
												<SmallSpinner size={14} className="text-primary" />
											) : (
												<span className="size-3 rounded-full border-2 border-subtle" />
											)}
										</div>
										{!last && <div className="mt-0.5 w-px flex-1 bg-border" />}
									</div>
									<div className={cn("flex min-w-0 flex-1 flex-col", last ? "pb-0.5" : "pb-2")}>
										<span className="text-xs leading-4 text-foreground">
											{step.label}
											{status === "active" && "…"}
											<span className="sr-only">
												{status === "complete" ? ", done" : status === "active" ? ", in progress" : ", not started"}
											</span>
										</span>
										{status === "active" && view.detail && (
											<span className="text-2xs text-tertiary-foreground">{view.detail}</span>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			)}

			{view.kind === "timed-out" && (
				<div className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<span className="mt-px shrink-0">
							<StatusChipIcon tone="amber" glyph="hourglass" />
						</span>
						<p className="min-w-0 flex-1 text-xs text-muted-foreground">{TIMED_OUT}</p>
					</div>
					<ActionBar className="pl-6">
						{enterManually && (
							<Button variant="primary" size="sm" onClick={onEnterManually}>
								Fill in details myself
							</Button>
						)}
						<IconButton
							variant="secondary"
							size="sm"
							icon={<ArrowClockwiseIcon size={12} />}
							onClick={onReExtract}
							disabled={isReExtracting}
						>
							Re-extract
						</IconButton>
						<Button variant="skeleton" size="sm" onClick={onCheckStatus} className="text-primary">
							Check again
						</Button>
					</ActionBar>
				</div>
			)}

			{view.kind === "done" && (
				<div className="flex flex-wrap items-center gap-2">
					<ShieldCheckIcon size={14} weight="fill" className="shrink-0 text-primary" aria-hidden="true" />
					<p className="min-w-0 flex-1 text-xs text-tertiary-foreground">
						Read by Cynco AI
						{view.confidence !== null && (
							<>
								{" · "}
								<span className="whitespace-nowrap tabular-nums text-foreground">
									{view.confidence}% {confidenceLabel(view.confidence)}
								</span>
							</>
						)}
					</p>
					{hasExtractedData && (
						<Button variant="secondary" size="sm" onClick={onReview}>
							Review
						</Button>
					)}
				</div>
			)}

			{view.kind === "failed" && (
				<div role="alert" className="flex flex-col gap-2">
					<div className="flex items-start gap-2">
						<span className="mt-px shrink-0">
							<StatusChipIcon tone="red" glyph="alert" />
						</span>
						<p className="min-w-0 flex-1 text-xs text-foreground">{view.message || FALLBACK_FAILURE}</p>
					</div>
					{view.retryable !== false && (
						<ActionBar className="pl-6">
							<IconButton
								variant="primary"
								size="sm"
								icon={<ArrowClockwiseIcon size={12} />}
								onClick={onReExtract}
								disabled={isReExtracting}
							>
								Re-extract
							</IconButton>
						</ActionBar>
					)}
				</div>
			)}
		</div>
	);
}
