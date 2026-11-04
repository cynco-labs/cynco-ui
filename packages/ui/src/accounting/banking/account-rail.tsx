"use client";

/**
 * Cynco UI — accounts as instruments: the institution mark, the net position
 * across every account, and the rail that switches between them.
 */
import {
	BankIcon,
	CreditCardIcon,
	type Icon,
	LightningIcon,
	PlugsIcon,
	PlusIcon,
	WalletIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, StatusChip, StatusChipIcon, useControllableState } from "../../base";
import { type Amount, toSen } from "../../lib/money";
import { formatCurrency, formatCurrencyCompact, negativeClass, surfaces } from "../../lib/shared";
import type { BankFeedStatus } from "./lifecycle";
import type { With } from "./shared";

export type BankRailAccount = {
	id: string;
	accountName: string;
	accountType: "checking" | "savings" | "credit_card" | "loan" | "ewallet" | "payment_provider" | string;
	balance: number;
	currency?: string;
	institution?: { name: string; shortName?: string; primaryColor?: string | null } | null;
	counts?: Partial<Record<BankFeedStatus, number>>;
	hasChainIssue?: boolean;
	/** Provider feed health, when the account is fed by a connection. */
	feed?: { health: "ok" | "partial" | "failed"; summary: string } | null;
};

const TYPE_ICON: Record<string, Icon> = {
	checking: BankIcon,
	savings: BankIcon,
	credit_card: CreditCardIcon,
	loan: WalletIcon,
	ewallet: WalletIcon,
};
const RAIL_GROUP: Record<string, string> = {
	checking: "Banks",
	savings: "Banks",
	credit_card: "Credit cards",
	payment_provider: "Payment providers",
};
const RAIL_ORDER = ["Banks", "Credit cards", "Payment providers", "Other"];

/** Relative luminance (WCAG 2.x) of a #rrggbb colour. */
function luminance(h: string) {
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(h.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The ink (black or white) with the higher WCAG contrast on a brand colour from data; one of them always reaches 4.5:1. */
function inkOn(hex?: string | null) {
	if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) return undefined;
	const bg = luminance(hex.replace("#", ""));
	const onWhite = 1.05 / (bg + 0.05);
	const onBlack = (bg + 0.05) / 0.05;
	return onBlack >= onWhite ? "#000" : "#fff";
}

/**
 * AccountAvatar / InstitutionLogo — a circular institution mark: the bank's
 * short code on its brand colour, or the account-type glyph when there is no
 * institution. 24px so rows with and without a logo align. Colour and size
 * styles are data-driven.
 */
export function BankAccountAvatar({
	account,
	size = 24,
	className,
	style,
	...props
}: With<
	{ account: Pick<BankRailAccount, "accountName" | "accountType" | "institution">; size?: number; className?: string },
	"span"
>) {
	const inst = account.institution;
	if (inst) {
		const label = (inst.shortName || inst.name || account.accountName).slice(0, 4);
		return (
			<span
				role="img"
				aria-label={inst.name}
				className={cn(
					"flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight",
					!inst.primaryColor && "bg-muted text-muted-foreground",
					className,
				)}
				style={{
					width: size,
					height: size,
					fontSize: Math.round(size * (label.length > 3 ? 0.3 : 0.36)),
					backgroundColor: inst.primaryColor ?? undefined,
					color: inkOn(inst.primaryColor),
					...style,
				}}
				{...props}
			>
				{label}
			</span>
		);
	}
	const Glyph = TYPE_ICON[account.accountType] ?? WalletIcon;
	return (
		<span
			className={cn("flex shrink-0 items-center justify-center text-tertiary-foreground", className)}
			style={{ width: size, height: size, ...style }}
			{...props}
		>
			<Glyph size={14} weight="fill" aria-hidden="true" />
		</span>
	);
}

/** Per-account horizontal aggregate of the lifecycle pipeline (band widths are data-driven). */
function SettledMeter({ counts, className }: { counts: Partial<Record<BankFeedStatus, number>>; className?: string }) {
	const imported = counts.imported ?? 0;
	const categorized = counts.categorized ?? 0;
	const posted = counts.posted ?? 0;
	const reconciled = counts.reconciled ?? 0;
	const total = imported + categorized + posted + reconciled;
	if (total === 0) return null;
	const pct = Math.round((reconciled / total) * 100);
	const bands = [
		{ key: "reconciled", n: reconciled, cls: "bg-status-green" },
		{ key: "posted", n: posted, cls: "bg-primary" },
		{ key: "categorized", n: categorized, cls: "bg-primary/40" },
		{ key: "imported", n: imported, cls: "bg-status-amber/70" },
	].filter((b) => b.n > 0);
	return (
		<span
			role="img"
			aria-label={`${pct}% reconciled: ${imported} to categorize, ${categorized} to post, ${posted} to reconcile`}
			title={`${pct}% reconciled`}
			className={
				cn("flex h-[3px] w-full gap-px overflow-hidden rounded-full", className) /* 3px hairline, off the spacing scale */
			}
		>
			{bands.map((b) => (
				<span key={b.key} className={cn("h-full rounded-full", b.cls)} style={{ width: `${(b.n / total) * 100}%` }} />
			))}
		</span>
	);
}

/** A bar's height in viewBox units. A shape, so the ratio crosses to a float here and nowhere else. */
const barHeight = (sen: bigint, max: bigint) => (Number(((sen < 0n ? -sen : sen) * 1000n) / max) / 1000) * 15;

function NetFlowSpark({ data }: { data: { month: string; net: Amount }[] }) {
	const bars = data.map((d) => ({ month: d.month, sen: toSen(d.net), label: formatCurrency(d.net) }));
	let max = 1n;
	for (const b of bars) {
		const size = b.sen < 0n ? -b.sen : b.sen;
		if (size > max) max = size;
	}
	const w = 100 / data.length;
	return (
		<svg
			viewBox="0 0 100 32"
			preserveAspectRatio="none"
			className="h-8 w-full"
			role="img"
			aria-label={`Net flow, last 6 months: ${bars.map((b) => `${b.month} ${b.label}`).join(", ")}`}
		>
			<line
				x1="0"
				x2="100"
				y1="16"
				y2="16"
				stroke="var(--chart-grid-stroke)"
				strokeWidth="0.5"
				vectorEffect="non-scaling-stroke"
			/>
			{bars.map((b, i) => {
				const hgt = barHeight(b.sen, max);
				return (
					<rect
						key={b.month}
						x={i * w + w * 0.18}
						width={w * 0.64}
						y={b.sen >= 0n ? 16 - hgt : 16}
						height={Math.max(hgt, 0.6)}
						rx="0.8"
						fill={b.sen >= 0n ? "var(--primary)" : "var(--destructive)"}
						opacity={b.sen >= 0n ? 0.85 : 0.6}
					>
						<title>{`${b.month}: ${b.label}`}</title>
					</rect>
				);
			})}
		</svg>
	);
}

const RAIL_HIT = "w-full cursor-pointer rounded-lg text-left transition-colors focus-ring";

/**
 * PositionRail — accounts as instruments: the all-accounts net position,
 * account rows grouped Banks / Credit cards / Payment providers (avatar,
 * name, feed glyph, statement-gap warning, compact balance, to-categorize
 * count, settled meter), the 6-month net-flow sparkline and add actions.
 * Currencies are never summed together. Fills its container's width.
 */
export function BankAccountRail({
	accounts,
	selectedId: selectedIdProp,
	defaultSelectedId = null,
	onSelectedIdChange,
	onAddAccount,
	onConnectProvider,
	net,
	cashFlow = [],
	className,
	...props
}: With<{
	accounts: BankRailAccount[];
	/** Controlled selection: an account id, or null for "All accounts". */
	selectedId?: string | null;
	/** Initial selection for uncontrolled use. */
	defaultSelectedId?: string | null;
	onSelectedIdChange?: (id: string | null) => void;
	/** Called from "Add account"; omit to hide it. */
	onAddAccount?: () => void;
	/** Called from "Connect a payment provider"; omit to hide it. */
	onConnectProvider?: () => void;
	/** One entry per currency; never summed across currencies. */
	net: { amount: number; currency: string }[];
	cashFlow?: { month: string; net: number }[];
	className?: string;
}>) {
	const [selectedId = null, setSelectedId] = useControllableState({
		prop: selectedIdProp,
		defaultProp: defaultSelectedId,
		onChange: onSelectedIdChange,
	});
	const groups = RAIL_ORDER.map((label) => ({
		label,
		list: accounts.filter((a) => (RAIL_GROUP[a.accountType] ?? "Other") === label),
	})).filter((g) => g.list.length > 0);
	const multi = net.length > 1;
	const railId = React.useId();
	return (
		<div className={cn("flex w-full min-w-0 flex-col", surfaces.card, className)} {...props}>
			<div className="border-b border-border p-2">
				<button
					type="button"
					aria-pressed={selectedId === null}
					onClick={() => setSelectedId(null)}
					className={cn(RAIL_HIT, "px-2.5 py-2.5", selectedId === null ? "bg-active-primary" : "hover:bg-muted")}
				>
					<p className="text-2xs font-medium text-tertiary-foreground">All accounts</p>
					{multi ? (
						<div className="mt-1 flex flex-col gap-0.5">
							{net.map((c) => (
								<p
									key={c.currency}
									className={cn("text-md font-medium tabular-nums text-foreground", negativeClass(toSen(c.amount) < 0n))}
								>
									{formatCurrencyCompact(c.amount, c.currency)}
								</p>
							))}
						</div>
					) : (
						<p className="text-display font-semibold text-foreground mt-1 tabular-nums">
							<span className={negativeClass(!!net[0] && toSen(net[0].amount) < 0n)}>
								{net[0] ? formatCurrencyCompact(net[0].amount, net[0].currency) : "—"}
							</span>
						</p>
					)}
				</button>
			</div>
			<nav aria-label="Bank accounts" className="flex flex-col gap-3 p-2">
				{groups.map((g) => (
					// biome-ignore lint/a11y/useSemanticElements: a labelled group of navigation buttons is not a <fieldset>
					<div key={g.label} role="group" aria-labelledby={`${railId}-${g.label}`}>
						<p id={`${railId}-${g.label}`} className="mb-1.5 px-2.5 text-2xs font-medium text-tertiary-foreground">
							{g.label}
						</p>
						<div className="flex flex-col gap-0.5">
							{g.list.map((a) => {
								const sel = selectedId === a.id;
								const attention = a.counts?.imported ?? 0;
								return (
									<button
										key={a.id}
										type="button"
										aria-pressed={sel}
										onClick={() => setSelectedId(a.id)}
										className={cn(RAIL_HIT, "group px-2.5 py-1.5", sel ? "bg-active-primary" : "hover:bg-muted")}
									>
										<span className="flex items-center gap-2.5">
											<BankAccountAvatar account={a} />
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-1">
													<span
														className={cn("block truncate text-sm font-medium", sel ? "text-foreground" : "text-muted-foreground")}
													>
														{a.accountName}
													</span>
													{a.feed &&
														(a.feed.health === "ok" ? (
															<LightningIcon
																size={11}
																className="size-3 shrink-0 text-tertiary-foreground"
																role="img"
																aria-label={a.feed.summary}
															/>
														) : (
															<>
																<StatusChipIcon tone={a.feed.health === "failed" ? "red" : "amber"} glyph="alert" className="size-3" />
																<span className="sr-only">{a.feed.summary}</span>
															</>
														))}
													{a.hasChainIssue && (
														<WarningIcon
															size={12}
															weight="fill"
															className="size-3 shrink-0 text-status-amber-text"
															role="img"
															aria-label="Statement gap: coverage is broken"
														/>
													)}
												</span>
												<span className="mt-0.5 block text-2xs tabular-nums text-tertiary-foreground">
													{formatCurrencyCompact(a.balance, a.currency || "MYR")}
												</span>
											</span>
											{attention > 0 && (
												<StatusChip tone="amber" glyph="alert" className="tabular-nums" title={`${attention} to categorize`}>
													{attention}
													<span className="sr-only"> to categorize</span>
												</StatusChip>
											)}
										</span>
										{a.counts && <SettledMeter counts={a.counts} className="mt-1.5" />}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</nav>
			<div className="mt-auto border-t border-border p-2">
				{cashFlow.some((c) => toSen(c.net) !== 0n) && (
					<div className="mb-1.5 px-2.5">
						<p className="mb-1 text-2xs font-medium text-tertiary-foreground">Net flow · 6 months</p>
						<NetFlowSpark data={cashFlow} />
					</div>
				)}
				{onAddAccount && (
					<Button variant="skeleton" className="w-full justify-start gap-2 text-primary" onClick={onAddAccount}>
						<PlusIcon size={14} className="size-3.5" aria-hidden="true" />
						Add account
					</Button>
				)}
				{onConnectProvider && (
					<Button
						variant="skeleton"
						className="w-full justify-start gap-2 text-muted-foreground"
						onClick={onConnectProvider}
					>
						<PlugsIcon size={14} className="size-3.5" aria-hidden="true" />
						Connect a payment provider
					</Button>
				)}
			</div>
		</div>
	);
}
