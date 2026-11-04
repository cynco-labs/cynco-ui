"use client";

import { PlusIcon, TrashIcon, WarningIcon } from "@phosphor-icons/react";
/**
 * Cynco UI — the lines of a journal entry, both ways round: the editable
 * debit/credit grid of a draft, and the read-only table of a saved entry.
 *
 * Every component sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import {
	Button,
	cn,
	IconButton,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	StatusChip,
	useControllableState,
} from "../../base";
import { STATUS_TONES } from "../../base/components/general/status-chip";
import { type Amount, fromSen, sumAmounts, toSen } from "../../lib/money";
import { type DataColumn, DataList, FieldError, formatCurrency } from "../../lib/shared";
import { AmountInput } from "../../productivity/entry";
import {
	AccountPickerList,
	isPositive,
	type LedgerPickerAccount,
	PICKER_POPUP,
	PickerTriggerLabel,
	TypeDot,
	typeLabel,
} from "./shared";

/**
 * For the one `aria-disabled` button that must keep its hover title (Button's own `focusableWhenDisabled`
 * turns pointer events off): it stays focusable and the handler ignores activation.
 */
const UNAVAILABLE = "aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

export type JournalEditorLine = {
	key: string;
	accountId?: string;
	accountCode?: string;
	accountName?: string;
	description?: string;
	debitAmount?: string;
	creditAmount?: string;
};

/**
 * Wide container: one grid row per line (Account · Description · Debit · Credit · remove).
 * Narrow container: each line is a small card — account and description full width, debit and credit side by side.
 */
const LINE_GRID_WIDE = "@xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_7rem_7rem_1.5rem] @xl:items-center";

export type JournalLineEditorProps = Omit<React.ComponentProps<"div">, "onChange"> & {
	/** Controlled lines. */
	lines?: JournalEditorLine[];
	/** Initial lines for uncontrolled use. */
	defaultLines?: JournalEditorLine[];
	accounts?: LedgerPickerAccount[];
	recentIds?: string[];
	/** Keyed `${line.key}.accountId`. */
	fieldErrors?: Record<string, string>;
	onLinesChange?: (lines: JournalEditorLine[]) => void;
};

/** journal/LineItemEditor.tsx — spreadsheet-style debit/credit grid with account picker cells. */
export function JournalLineEditor({
	lines: linesProp,
	defaultLines = [],
	accounts = [],
	recentIds,
	fieldErrors = {},
	onLinesChange,
	className,
	...props
}: JournalLineEditorProps) {
	const [lines = defaultLines, setLines] = useControllableState({
		prop: linesProp,
		defaultProp: defaultLines,
		onChange: onLinesChange,
	});
	const [openKey, setOpenKey] = React.useState<string | null>(null);
	const counter = React.useRef(0);
	const id = React.useId();
	const listRef = React.useRef<HTMLDivElement>(null);
	/** Index of a removed line: its Remove button unmounts, so focus moves to the line that takes its place. */
	const refocus = React.useRef<number | null>(null);
	React.useEffect(() => {
		const i = refocus.current;
		if (i === null) return;
		refocus.current = null;
		const buttons = listRef.current?.querySelectorAll<HTMLElement>("[data-line-remove]");
		if (buttons && buttons.length > 0) buttons[Math.min(i, buttons.length - 1)]?.focus();
	}, [lines]);
	const addLine = () =>
		setLines([...lines, { key: `new_${++counter.current}`, debitAmount: "", creditAmount: "", description: "" }]);
	const removeLine = (key: string) => {
		if (lines.length <= 2) return;
		refocus.current = lines.findIndex((l) => l.key === key);
		setLines(lines.filter((l) => l.key !== key));
	};
	const update = (key: string, field: keyof JournalEditorLine, value: string) =>
		setLines(
			lines.map((l) => {
				if (l.key !== key) return l;
				const u = { ...l, [field]: value };
				// Auto-clear the opposite amount field.
				if (field === "debitAmount" && isPositive(value)) u.creditAmount = "";
				if (field === "creditAmount" && isPositive(value)) u.debitAmount = "";
				return u;
			}),
		);
	const setAccount = (key: string, a: LedgerPickerAccount) =>
		setLines(
			lines.map((l) =>
				l.key === key ? { ...l, accountId: a.id, accountCode: a.accountCode, accountName: a.accountName } : l,
			),
		);

	return (
		<div className={cn("@container flex min-w-0 flex-col", className)} {...props}>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h3 className="text-md font-semibold text-muted-foreground">Line items</h3>
				<IconButton variant="secondary" size="sm" icon={<PlusIcon weight="bold" />} onClick={addLine}>
					Add line
				</IconButton>
			</div>
			{/* Visual column heads only: every field carries its own "…, line N" name. */}
			<div
				aria-hidden="true"
				className={cn("mb-1.5 hidden gap-2 px-0.5 text-2xs text-tertiary-foreground @xl:grid", LINE_GRID_WIDE)}
			>
				<span>Account</span>
				<span>Description</span>
				<span className="text-right">Debit</span>
				<span className="text-right">Credit</span>
				<span />
			</div>
			<div ref={listRef} className="flex flex-col gap-2 @xl:gap-1.5">
				{lines.map((line, i) => {
					const warn = !line.accountId && !!line.accountCode;
					const err = fieldErrors[`${line.key}.accountId`];
					const account = line.accountId ? accounts.find((a) => a.id === line.accountId) : undefined;
					const shown: LedgerPickerAccount | null =
						account ??
						(line.accountCode
							? {
									id: "",
									accountCode: line.accountCode,
									accountName: line.accountName ?? "",
									accountType: "",
									normalBalance: "debit",
								}
							: null);
					const n = i + 1;
					const errId = `${id}-${line.key}-error`;
					return (
						<div key={line.key} className="flex flex-col gap-0.5">
							{/* biome-ignore lint/a11y/useSemanticElements: <fieldset> sets its own min-width and would break the line's grid columns */}
							<div
								role="group"
								aria-label={`Line ${i + 1}`}
								className={cn(
									"group grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1.5rem] items-center gap-2 rounded-lg border bg-card p-2 @xl:rounded-none @xl:border-0 @xl:bg-transparent @xl:p-0",
									LINE_GRID_WIDE,
								)}
							>
								<div className="col-span-3 min-w-0 @xl:col-span-1">
									<Popover open={openKey === line.key} onOpenChange={(o) => setOpenKey(o ? line.key : null)}>
										<PopoverTrigger
											render={
												<Button
													variant="secondary"
													aria-label={`Account, line ${n}${warn ? ", unconfirmed AI suggestion" : ""}: ${shown ? `${shown.accountCode} ${shown.accountName}` : "Select account..."}`}
													aria-invalid={err ? true : undefined}
													aria-describedby={err ? errId : undefined}
													title={warn ? `AI suggested ${line.accountCode}: confirm via picker` : undefined}
													className={cn(
														"w-full min-w-0 justify-start font-normal [&>span]:min-w-0 [&>span]:gap-1.5 [&>span]:overflow-hidden",
														(warn || err) && "border-dashed",
													)}
												>
													{warn && (
														<WarningIcon
															weight="fill"
															size={14}
															className={cn("shrink-0", STATUS_TONES.amber)}
															aria-label="Unconfirmed AI suggestion"
														/>
													)}
													<PickerTriggerLabel account={shown} />
												</Button>
											}
										/>
										<PopoverContent align="start" aria-label="Choose account" className={PICKER_POPUP}>
											<AccountPickerList
												accounts={accounts}
												recentIds={recentIds}
												selectedId={line.accountId}
												onSelect={(a) => {
													setAccount(line.key, a);
													setOpenKey(null);
												}}
											/>
										</PopoverContent>
									</Popover>
								</div>
								<Input
									aria-label={`Description, line ${n}`}
									placeholder="Line description..."
									value={line.description ?? ""}
									onChange={(e) => update(line.key, "description", e.target.value)}
									className="col-span-3 @xl:col-span-1"
								/>
								<AmountInput
									placeholder="Debit"
									aria-label={`Debit, line ${n}`}
									messages="overlay"
									allowNegative
									inputClassName="min-w-24"
									value={line.debitAmount ?? ""}
									onValueChange={(v) => update(line.key, "debitAmount", v)}
								/>
								<AmountInput
									placeholder="Credit"
									aria-label={`Credit, line ${n}`}
									messages="overlay"
									allowNegative
									inputClassName="min-w-24"
									value={line.creditAmount ?? ""}
									onValueChange={(v) => update(line.key, "creditAmount", v)}
								/>
								<IconButton
									variant="skeleton"
									size="icon"
									data-line-remove=""
									aria-label={`Remove line ${n}`}
									aria-disabled={lines.length <= 2 || undefined}
									title={lines.length <= 2 ? "Minimum 2 lines required for double-entry" : undefined}
									className={cn(
										"justify-self-center transition-opacity @xl:opacity-40 @xl:group-hover:opacity-100 focus-visible:opacity-100",
										UNAVAILABLE,
									)}
									icon={<TrashIcon />}
									onClick={() => removeLine(line.key)}
								/>
							</div>
							{err && (
								<FieldError id={errId} className="pl-0.5">
									{err}
								</FieldError>
							)}
						</div>
					);
				})}
			</div>
			<Button variant="dotted" className="mt-2 w-full text-tertiary-foreground" onClick={addLine}>
				<PlusIcon size={14} aria-hidden="true" />
				Add line
			</Button>
		</div>
	);
}

export type JournalPostedLine = {
	id: string;
	lineNumber: number;
	accountCode: string;
	accountName: string;
	accountType: string;
	debitAmount: Amount;
	creditAmount: Amount;
	description?: string | null;
};

/** The amount a line carries, marked by side — the one figure a stacked line shows. */
function SidedAmount({ debit, credit, currency }: { debit: Amount; credit: Amount; currency: string }) {
	const isCredit = isPositive(credit) && !isPositive(debit);
	return (
		<span className="inline-flex items-baseline gap-1 tabular-nums">
			{formatCurrency(isCredit ? credit : debit, currency)}
			<span className="text-2xs font-normal text-tertiary-foreground">{isCredit ? "Cr" : "Dr"}</span>
		</span>
	);
}

export type JournalLinesTableProps = React.ComponentProps<"section"> & {
	lines: JournalPostedLine[];
	currency?: string;
	/** The entry's posted debit total. Omit it and the table adds the lines, which a draft wants and a posted entry does not. */
	totalDebit?: Amount;
	/** The entry's posted credit total, on the same terms as `totalDebit`. */
	totalCredit?: Amount;
};

/** journal/JournalLineItemsTable.tsx — the read-only lines of a saved entry with totals. */
export function JournalLinesTable({
	lines,
	currency = "MYR",
	totalDebit,
	totalCredit,
	className,
	...props
}: JournalLinesTableProps) {
	const dr = totalDebit ?? sumAmounts(lines.map((l) => l.debitAmount));
	const cr = totalCredit ?? sumAmounts(lines.map((l) => l.creditAmount));
	const balanced = toSen(dr) === toSen(cr);
	const money = (v: Amount) => (isPositive(v) ? formatCurrency(fromSen(toSen(v)), currency) : "");
	const columns: DataColumn<JournalPostedLine>[] = [
		{
			key: "n",
			header: "#",
			className: "w-9 text-tertiary-foreground tabular-nums",
			mobile: "hidden",
			cell: (l) => l.lineNumber,
		},
		{
			key: "account",
			header: "Account",
			className: "w-2/5",
			mobile: "title",
			// The row header: a line is named by its account, not its line number.
			primary: true,
			cell: (l) => (
				<span className="flex min-w-0 items-center gap-2">
					<span className="shrink-0 font-mono text-2xs font-medium text-tertiary-foreground">{l.accountCode}</span>
					<span className="min-w-0 break-words">{l.accountName}</span>
					<TypeDot type={l.accountType} />
					<span className="sr-only">{typeLabel(l.accountType)}</span>
				</span>
			),
		},
		{
			key: "description",
			header: "Description",
			className: "w-1/3 max-w-0",
			cell: (l) => (
				<span className="block text-tertiary-foreground @xl:truncate" title={l.description ?? undefined}>
					{l.description || "—"}
				</span>
			),
		},
		{ key: "debit", header: "Debit", align: "right", mobile: "hidden", cell: (l) => money(l.debitAmount) },
		{ key: "credit", header: "Credit", align: "right", mobile: "hidden", cell: (l) => money(l.creditAmount) },
		// Stacked layout only: one figure per line, marked Dr/Cr.
		{
			key: "amount",
			header: "Amount",
			className: "hidden",
			mobile: "value",
			cell: (l) => <SidedAmount debit={l.debitAmount} credit={l.creditAmount} currency={currency} />,
		},
	];
	return (
		<section className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
				<h3 className="text-md font-semibold text-muted-foreground">Line items</h3>
				{balanced ? (
					<StatusChip tone="green" glyph="check">
						Balanced
					</StatusChip>
				) : (
					<StatusChip tone="red" glyph="x">
						Unbalanced
					</StatusChip>
				)}
			</div>
			<DataList
				caption="Journal entry line items"
				columns={columns}
				rows={lines}
				getKey={(l) => l.id}
				dense
				empty="No line items"
				footer={
					<div className="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1 font-semibold text-foreground tabular-nums">
						<span className="mr-auto font-medium text-tertiary-foreground">Total</span>
						<span>
							<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Debit</span>
							{formatCurrency(dr, currency)}
						</span>
						<span>
							<span className="mr-1.5 text-2xs font-normal text-tertiary-foreground">Credit</span>
							{formatCurrency(cr, currency)}
						</span>
					</div>
				}
			/>
		</section>
	);
}
