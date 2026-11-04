"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the title bar and metric strip that open every accounting
 * workbench tab.
 */
import * as React from "react";
import { cn, StatusChipIcon, type StatusGlyph, type StatusTone } from "../../base";
import { ActionBar, StatGrid, StatTile } from "../../lib/shared";

export type WorkbenchStat = {
	key: string;
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	href?: string;
	status?: "success" | "warning" | "danger";
};

const STAT_STATUS: Record<
	NonNullable<WorkbenchStat["status"]>,
	{ tone: StatusTone; glyph: StatusGlyph; word: string }
> = {
	success: { tone: "green", glyph: "check", word: "OK" },
	warning: { tone: "amber", glyph: "alert", word: "Warning" },
	danger: { tone: "red", glyph: "x", word: "Problem" },
};

export type AccountingWorkbenchHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
	title: React.ReactNode;
	meta?: React.ReactNode;
	actions?: React.ReactNode;
	stats?: WorkbenchStat[];
};

/** workbench-chrome.tsx WorkbenchHeader + StatGrid — the title bar and metric strip that open every workbench tab. */
export function AccountingWorkbenchHeader({
	title,
	meta,
	actions,
	stats = [],
	className,
	...props
}: AccountingWorkbenchHeaderProps) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
				<div className="min-w-0">
					<h1 className="break-words text-lg font-semibold text-foreground">{title}</h1>
					{meta && <p className="text-2xs text-tertiary-foreground">{meta}</p>}
				</div>
				{actions && <ActionBar>{actions}</ActionBar>}
			</div>
			{stats.length > 0 && (
				<StatGrid min="md">
					{stats.map((s) => {
						const value = s.status ? (
							// biome-ignore lint/correctness/useJsxKeyInIterable: the key sits on the element this callback returns, which wraps this one
							<span className="inline-flex items-center gap-1.5">
								<StatusChipIcon tone={STAT_STATUS[s.status].tone} glyph={STAT_STATUS[s.status].glyph} />
								<span className="sr-only">{STAT_STATUS[s.status].word}: </span>
								{s.value}
							</span>
						) : (
							s.value
						);
						const tile = (
							// biome-ignore lint/correctness/useJsxKeyInIterable: the key sits on the element this callback returns, which wraps this one
							<StatTile
								label={s.label}
								value={value}
								sub={s.hint}
								className={cn("h-full", s.href && "transition-colors group-hover:border-primary/40")}
								badge={
									s.href ? (
										<ArrowUpRightIcon
											weight="bold"
											size={14}
											aria-hidden="true"
											className="text-tertiary-foreground opacity-0 transition-opacity group-hover:opacity-100 no-hover:opacity-100"
										/>
									) : undefined
								}
							/>
						);
						return s.href ? (
							<a
								key={s.key}
								href={s.href}
								onClick={(e) => e.preventDefault()}
								className="group block min-w-0 rounded-xl focus-ring"
							>
								{tile}
							</a>
						) : (
							<React.Fragment key={s.key}>{tile}</React.Fragment>
						);
					})}
				</StatGrid>
			)}
		</div>
	);
}
