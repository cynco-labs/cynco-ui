"use client";

/**
 * Cynco UI — the banking workspace's one picture of proof: a row of terms
 * that add up, set against what another source says, and the verdict chip
 * that says whether the two agree.
 */
import { cn, StatusChip, StatusChipIcon, type StatusGlyph, type StatusTone } from "../../base";
import { type Amount, absAmount, fromSen, subtractAmounts, sumAmounts, toSen } from "../../lib/money";
import { formatCurrency } from "../../lib/shared";
import { Shimmer, type With } from "./shared";

/** `undefined` = still being worked out (shimmers); `null` = unknown. */
export type BankEquationAmount = Amount | null | undefined;
export type BankEquationTerm = { label: string; amount: BankEquationAmount; op?: "plus" | "minus"; hint?: string };
export type BankEquationCheck = { label: string; amount: BankEquationAmount };

type Verdict =
	| { kind: "ties" }
	| { kind: "off"; difference: Amount }
	| { kind: "unknown" }
	| { kind: "pending" }
	| { kind: "result" };

function solveEquation(
	terms: readonly BankEquationTerm[],
	check?: BankEquationCheck,
): { result: BankEquationAmount; verdict: Verdict } {
	let result: BankEquationAmount = "0.00";
	for (const t of terms) {
		if (t.amount === undefined) {
			result = undefined;
			break;
		}
		if (t.amount === null) {
			result = null;
			continue;
		}
		if (result !== null) result = t.op === "minus" ? subtractAmounts(result, t.amount) : sumAmounts([result, t.amount]);
	}
	if (!check) return { result, verdict: { kind: "result" } };
	if (result === undefined || check.amount === undefined) return { result, verdict: { kind: "pending" } };
	if (result === null || check.amount === null) return { result, verdict: { kind: "unknown" } };
	const diffSen = toSen(result) - toSen(check.amount);
	return { result, verdict: diffSen === 0n ? { kind: "ties" } : { kind: "off", difference: fromSen(diffSen) } };
}

function EqCell({
	label,
	amount,
	hint,
	currency,
	size,
	emphasis,
}: {
	label: string;
	amount: BankEquationAmount;
	hint?: string;
	currency?: string;
	size: "sm" | "md";
	emphasis?: boolean;
}) {
	return (
		<div className="flex min-w-0 flex-col">
			<span className="text-2xs leading-4 text-tertiary-foreground">{label}</span>
			{amount === undefined ? (
				<Shimmer label="Working out" className={cn("my-1 w-24", size === "md" ? "h-4" : "h-3")} />
			) : (
				<span
					className={cn(
						"whitespace-nowrap tabular-nums",
						size === "md" ? "text-md leading-6" : "text-sm leading-5",
						amount === null
							? "font-normal text-tertiary-foreground"
							: emphasis
								? "font-semibold text-foreground"
								: "font-medium text-foreground",
					)}
				>
					{amount === null ? "Unknown" : formatCurrency(amount, currency)}
				</span>
			)}
			{hint && <span className="text-2xs leading-4 text-tertiary-foreground">{hint}</span>}
		</div>
	);
}

function EqOp({ glyph, spoken, size }: { glyph: string; spoken: string; size: "sm" | "md" }) {
	return (
		<span className="flex flex-col">
			<span aria-hidden="true" className="invisible text-2xs leading-4">
				.
			</span>
			<span
				aria-hidden="true"
				className={cn("tabular-nums text-tertiary-foreground", size === "md" ? "text-md leading-6" : "text-sm leading-5")}
			>
				{glyph}
			</span>
			<span className="sr-only">{spoken}</span>
		</span>
	);
}

/** A verdict chip whose label wraps instead of truncating when the column is narrow. */
function VerdictChip({ tone, glyph, children }: { tone: StatusTone; glyph: StatusGlyph; children: string }) {
	return (
		<StatusChip tone={tone} glyph={glyph} title={children} className="h-auto min-h-5.5 py-0.5 whitespace-normal">
			<span className="min-w-0">{children}</span>
		</StatusChip>
	);
}

function EqVerdict({
	verdict,
	currency,
	tiesLabel,
	unknownLabel,
}: {
	verdict: Verdict;
	currency?: string;
	tiesLabel: string;
	unknownLabel: string;
}) {
	switch (verdict.kind) {
		case "ties":
			return (
				<VerdictChip tone="green" glyph="check">
					{tiesLabel}
				</VerdictChip>
			);
		case "off":
			return (
				<VerdictChip
					tone="amber"
					glyph="alert"
				>{`Off by ${formatCurrency(absAmount(verdict.difference), currency)}`}</VerdictChip>
			);
		case "unknown":
			return (
				<VerdictChip tone="neutral" glyph="minus">
					{unknownLabel}
				</VerdictChip>
			);
		case "pending":
			return <Shimmer label="Checking" className="my-0.5 h-5.5 w-20 rounded-md" />;
		default:
			return null;
	}
}

/**
 * BalanceEquation — the banking workspace's one picture of proof: opening +
 * money in − money out = closing, set against what the statement or ledger
 * says. Terms still being worked out shimmer; the verdict chip says Ties,
 * Off by RM x, or why it can't be verified. Terms wrap onto new lines.
 */
export function BankBalanceEquation({
	terms,
	resultLabel,
	check,
	currency = "MYR",
	tiesLabel = "Ties",
	unknownLabel = "Can't verify",
	size = "md",
	className,
	...props
}: With<{
	terms: readonly BankEquationTerm[];
	resultLabel: string;
	check?: BankEquationCheck;
	currency?: string;
	tiesLabel?: string;
	unknownLabel?: string;
	size?: "sm" | "md";
	className?: string;
}>) {
	const { result, verdict } = solveEquation(terms, check);
	return (
		// biome-ignore lint/a11y/useSemanticElements: a labelled group of read-only figures is not a <fieldset>
		<div
			role="group"
			aria-label={`${resultLabel} calculation`}
			className={cn("flex min-w-0 flex-wrap items-start gap-x-3 gap-y-3", className)}
			{...props}
		>
			{terms.map((t, i) => (
				<div key={t.label} className="flex min-w-0 items-start gap-x-3">
					{i > 0 && <EqOp glyph={t.op === "minus" ? "−" : "+"} spoken={t.op === "minus" ? "minus" : "plus"} size={size} />}
					<EqCell label={t.label} amount={t.amount} hint={t.hint} currency={currency} size={size} />
				</div>
			))}
			<div className="flex min-w-0 items-start gap-x-3">
				<EqOp glyph="=" spoken="equals" size={size} />
				<EqCell label={resultLabel} amount={result} currency={currency} size={size} emphasis />
			</div>
			{check && (
				<div className="flex min-w-0 max-w-full flex-wrap items-start gap-x-3 gap-y-1 border-l border-border pl-3">
					<EqCell label={check.label} amount={check.amount} currency={currency} size={size} />
					{/* Mounted with the equation, so a change to Ties / Off by is announced politely. */}
					<div role="status" className="flex min-w-0 max-w-full flex-col">
						<span aria-hidden="true" className="invisible text-2xs leading-4">
							.
						</span>
						<EqVerdict verdict={verdict} currency={currency} tiesLabel={tiesLabel} unknownLabel={unknownLabel} />
					</div>
				</div>
			)}
		</div>
	);
}

export type BankParsedStatement = {
	openingBalance: Amount | null;
	closingBalance: Amount | null;
	totalCredits: Amount;
	totalDebits: Amount;
	creditLines: number;
	debitLines: number;
};

function brokenRowsLabel(indices: readonly number[]): string {
	const rows = indices.map((i) => String(i + 1));
	if (rows.length === 1) return `row ${rows[0]}`;
	const shown = rows.slice(0, 5);
	const rest = rows.length - shown.length;
	return rest > 0
		? `rows ${shown.join(", ")} and ${rest} more`
		: `rows ${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

/**
 * StatementEquation — a statement's own proof: opening + money in − money
 * out against the closing balance it prints. Null `statement` = still being
 * read (shimmers). A broken running balance is called out by row.
 */
export function BankStatementEquation({
	statement,
	chainValid = true,
	brokenRows = [],
	currency = "MYR",
	size = "md",
	className,
	...props
}: With<{
	statement: BankParsedStatement | null;
	chainValid?: boolean;
	brokenRows?: number[];
	currency?: string;
	size?: "sm" | "md";
	className?: string;
}>) {
	const opening = statement ? statement.openingBalance : undefined;
	const closing = statement ? statement.closingBalance : undefined;
	const lines = (n: number) => `${n} ${n === 1 ? "line" : "lines"}`;
	return (
		<div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<BankBalanceEquation
				size={size}
				currency={currency}
				terms={[
					{ label: "Opening", amount: opening },
					{
						label: "Money in",
						amount: statement?.totalCredits,
						op: "plus",
						hint: statement ? lines(statement.creditLines) : undefined,
					},
					{
						label: "Money out",
						amount: statement?.totalDebits,
						op: "minus",
						hint: statement ? lines(statement.debitLines) : undefined,
					},
				]}
				resultLabel="Closing"
				check={{ label: "Statement closing", amount: closing }}
				tiesLabel="Ties to the statement"
				unknownLabel={
					opening === null
						? "Can't verify, no opening balance on the statement"
						: "Can't verify, no closing balance on the statement"
				}
			/>
			{!chainValid && (
				<p className="flex items-start gap-1.5 text-2xs text-muted-foreground">
					<StatusChipIcon tone="amber" glyph="alert" className="mt-px size-3" />
					<span>
						{brokenRows.length > 0
							? `The running balance breaks at ${brokenRowsLabel(brokenRows)}.`
							: "The running balance breaks on some rows."}{" "}
						Those rows may post in the wrong direction.
					</span>
				</p>
			)}
		</div>
	);
}
