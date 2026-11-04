"use client";

import { CaretRightIcon, HeartbeatIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { cn, StatusChipIcon } from "../../base";
import { SectionPanel } from "../../lib/shared";
import { CHECK_SEVERITY, type CheckSeverity } from "../shared";
import { RowLink } from "./shared";

/** Panel title with a leading glyph (cynco dashboard/overview/Panel header). */
function IconTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<span className="flex min-w-0 items-center gap-2">
			<span aria-hidden="true" className="shrink-0 text-tertiary-foreground [&>svg]:size-4">
				{icon}
			</span>
			<span className="truncate">{children}</span>
		</span>
	);
}

export type HealthCheckStatus = "fail" | "warn" | "pass" | "na";
export type HealthArea = "books" | "collections" | "payables" | "compliance";
export interface HealthCheck {
	id: string;
	label: string;
	detail: string;
	area: HealthArea;
	status: HealthCheckStatus;
	/** Where the control is fixed. */
	href?: string;
}

const AREA_LABEL: Record<HealthArea, string> = {
	books: "Books",
	collections: "Collections",
	payables: "Payables",
	compliance: "Compliance",
};
/** A check's own verdict, said in the library's one vocabulary for how severe a result is. */
const CHECK_SEVERITY_OF: Record<HealthCheckStatus, CheckSeverity> = {
	fail: "fail",
	warn: "attention",
	pass: "pass",
	na: "na",
};

function healthSummary(checks: HealthCheck[]): string {
	const acting = checks.filter((c) => c.status === "fail" || c.status === "warn").length;
	const judged = checks.filter((c) => c.status !== "na").length;
	if (judged === 0) return "Nothing to check yet";
	if (acting === 0) return judged === 1 ? "The one check passes" : `All ${judged} checks pass`;
	return `${acting} of ${judged} check${judged === 1 ? "" : "s"} need${acting === 1 ? "s" : ""} you`;
}

/**
 * The controls checklist (cynco dashboard/overview/HealthPanel): every check,
 * its verdict, one line of evidence and the area it belongs to. Fails first.
 * The area tag hides below 24rem of container width.
 */
export function BusinessHealthPanel({
	checks,
	className,
	...props
}: React.ComponentProps<"section"> & { checks: HealthCheck[] | null }) {
	const order: HealthCheckStatus[] = ["fail", "warn", "pass", "na"];
	const sorted = checks ? [...checks].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)) : null;
	return (
		<SectionPanel
			flush
			className={cn("overflow-hidden", className)}
			{...props}
			title={<IconTitle icon={<HeartbeatIcon weight="duotone" />}>Checks</IconTitle>}
			actions={sorted && <span className="text-2xs text-tertiary-foreground">{healthSummary(sorted)}</span>}
		>
			{sorted === null ? (
				<p className="px-4 py-8 text-center text-2xs text-tertiary-foreground">Couldn&rsquo;t run the checks right now.</p>
			) : sorted.length === 0 ? (
				<p className="px-4 py-8 text-center text-2xs text-tertiary-foreground">
					Nothing to check yet. Set up the books and the filing calendar and the controls appear here.
				</p>
			) : (
				<ul className="border-t border-table-row-divider">
					{sorted.map((check) => {
						const s = CHECK_SEVERITY[CHECK_SEVERITY_OF[check.status]];
						return (
							<li key={check.id} className="border-b border-table-row-divider last:border-b-0">
								<RowLink href={check.href} className="min-h-10 px-4 py-1.5">
									<StatusChipIcon tone={s.tone} glyph={s.glyph} />
									<span className="sr-only">{s.name}:</span>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm text-foreground">{check.label}</span>
										<span className="block text-2xs text-tertiary-foreground @md:truncate" title={check.detail}>
											{check.detail}
										</span>
									</span>
									<span className="hidden shrink-0 text-2xs font-medium uppercase tracking-[0.04em] text-tertiary-foreground @sm:inline">
										{AREA_LABEL[check.area]}
									</span>
									{check.href && <CaretRightIcon size={12} aria-hidden="true" className="shrink-0 text-tertiary-foreground" />}
								</RowLink>
							</li>
						);
					})}
				</ul>
			)}
		</SectionPanel>
	);
}
