"use client";

import {
	ArrowDownIcon,
	ArrowUpIcon,
	CheckIcon,
	ClockIcon,
	PencilSimpleIcon,
	PowerIcon,
	XIcon,
} from "@phosphor-icons/react";
/**
 * Cynco UI — the detail panel beside the Chart of Accounts tree.
 *
 * It sizes itself by its CONTAINER (`@container` + `@md:`/`@xl:` variants),
 * so it works in a full page, a side sheet or a 360px phone.
 */
import * as React from "react";
import { Alert, Badge, Button, cn, IconButton, Input, useControllableState } from "../../base";
import { parseDate } from "../../base/lib/utils";
import { type Amount, toSen } from "../../lib/money";
import {
	ActionBar,
	type DataColumn,
	DataList,
	formatCurrency,
	formatDate,
	formatPlain,
	negativeClass,
	SectionLabel,
	StatTile,
	surfaces,
	ToneDot,
} from "../../lib/shared";
import { TypeDot, typeLabel } from "./shared";

export type CoaPanelAccount = {
	accountCode: string;
	accountName: string;
	accountType: string;
	normalBalance: "debit" | "credit";
	description?: string | null;
	isActive: boolean;
	isSystemAccount?: boolean;
	isBankAccount?: boolean;
	isCashAccount?: boolean;
	isRetainedEarnings?: boolean;
	taxRelated?: boolean;
	currency?: string | null;
	isMonetary?: boolean | null;
	mappingKeywords?: string[];
};

type BalanceHistoryRow = { period: string; periodDebit: Amount; periodCredit: Amount; closingBalance: Amount };

const BALANCE_HISTORY_COLUMNS: DataColumn<BalanceHistoryRow>[] = [
	{
		key: "period",
		header: "Period",
		mobile: "title",
		cell: (h) => <span className="font-mono text-2xs font-medium text-tertiary-foreground">{h.period}</span>,
	},
	{ key: "dr", header: "Debit", align: "right", cell: (h) => formatPlain(h.periodDebit) },
	{ key: "cr", header: "Credit", align: "right", cell: (h) => formatPlain(h.periodCredit) },
	{
		key: "closing",
		header: "Closing",
		align: "right",
		mobile: "value",
		cell: (h) => (
			<span className={cn("font-medium", negativeClass(toSen(h.closingBalance) < 0n))}>
				{formatPlain(h.closingBalance)}
			</span>
		),
	},
];

export type CoaAccountPanelProps = React.ComponentProps<"aside"> & {
	account: CoaPanelAccount;
	currency?: string;
	currentBalance?: Amount;
	transactionCount?: number;
	lastTransactionAt?: string | null;
	balanceHistory?: BalanceHistoryRow[];
	transactions?: {
		id: string;
		date: string;
		description: string;
		type: "debit" | "credit";
		amount: Amount;
		source?: string;
	}[];
	/** Controlled edit form. */
	editing?: boolean;
	/** Whether the edit form starts open, for uncontrolled use. */
	defaultEditing?: boolean;
	onEditingChange?: (editing: boolean) => void;
	onClose?: () => void;
	/** Called from Activate / Deactivate with the new state; omit to hide the button. The panel shows `account.isActive`. */
	onActiveChange?: (active: boolean) => void;
};

/** CoaAccountDetailPanel.tsx — the right-hand panel for the selected account. */
export function CoaAccountPanel({
	account,
	currency = "MYR",
	currentBalance = "0.00",
	transactionCount = 0,
	lastTransactionAt,
	balanceHistory = [],
	transactions = [],
	editing: editingProp,
	defaultEditing = false,
	onEditingChange,
	onClose,
	onActiveChange,
	className,
	...props
}: CoaAccountPanelProps) {
	const [editing = false, setEditing] = useControllableState({
		prop: editingProp,
		defaultProp: defaultEditing,
		onChange: onEditingChange,
	});
	const active = account.isActive;
	const editRef = React.useRef<HTMLButtonElement>(null);
	/** Save and Cancel unmount with the form, so focus returns to the Edit button that opened it. */
	const closeEditor = () => {
		setEditing(false);
		editRef.current?.focus();
	};
	const flags = [
		account.isSystemAccount && "System",
		account.isBankAccount && "Bank",
		account.isCashAccount && "Cash",
		account.isRetainedEarnings && "Retained earnings",
		account.taxRelated && "Tax related",
		account.currency && `${account.currency} only`,
		account.isMonetary === true && "Monetary",
		account.isMonetary === false && "Non-monetary",
	].filter((f): f is string => typeof f === "string");
	return (
		<aside className={cn("@container flex w-full min-w-0 flex-col overflow-hidden", surfaces.card, className)} {...props}>
			<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
				<div className="min-w-0 flex-1">
					<h2 className="break-words text-sm font-semibold text-foreground">{account.accountName}</h2>
					<p className="flex items-center gap-1.5 truncate text-2xs text-tertiary-foreground">
						<span className="font-mono text-2xs font-medium">{account.accountCode}</span>·
						<TypeDot type={account.accountType} />
						{typeLabel(account.accountType)}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{!account.isSystemAccount && (
						<IconButton
							ref={editRef}
							variant="skeleton"
							size="icon"
							aria-label="Edit account"
							aria-expanded={editing}
							icon={<PencilSimpleIcon weight="bold" />}
							onClick={() => setEditing(!editing)}
						/>
					)}
					<IconButton
						variant="skeleton"
						size="icon"
						aria-label="Close detail panel"
						icon={<XIcon weight="bold" />}
						onClick={onClose}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-4 p-4">
				<StatTile
					className="bg-interactive-secondary"
					label="Current balance"
					value={
						<span className={cn(toSen(currentBalance) === 0n && "text-tertiary-foreground")}>
							{formatCurrency(currentBalance, currency)}
						</span>
					}
					negative={toSen(currentBalance) < 0n}
					sub={
						<span className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
							<span className="flex items-center gap-1">
								<ClockIcon size={12} aria-hidden="true" />
								{transactionCount} transactions
							</span>
							{lastTransactionAt && (
								<span>
									Last: {parseDate(lastTransactionAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
								</span>
							)}
						</span>
					}
				/>

				{editing && (
					<form
						className="flex flex-col gap-3 rounded-lg border bg-background p-3"
						onSubmit={(e) => {
							e.preventDefault();
							closeEditor();
						}}
					>
						<div className="text-sm font-semibold text-foreground">Edit account</div>
						{transactionCount > 0 && (
							<Alert variant="warning" role="note" className="px-2.5 py-1.5 text-2xs">
								This account has {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}. Changing the code or name
								will affect existing reports. Account type cannot be changed.
							</Alert>
						)}
						<label className="flex flex-col gap-1">
							<span className="text-sm font-medium text-muted-foreground">Account code</span>
							<Input defaultValue={account.accountCode} className="font-mono text-xs" required />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm font-medium text-muted-foreground">Account name</span>
							<Input defaultValue={account.accountName} required />
						</label>
						<label className="flex flex-col gap-1">
							<span className="text-sm font-medium text-muted-foreground">Description</span>
							<Input defaultValue={account.description ?? ""} placeholder="Optional description" />
						</label>
						<ActionBar>
							<IconButton type="submit" variant="primary" icon={<CheckIcon weight="bold" />}>
								Save
							</IconButton>
							<Button type="button" variant="skeleton" onClick={closeEditor}>
								Cancel
							</Button>
						</ActionBar>
					</form>
				)}

				<div className="flex flex-col gap-3">
					{account.description && (
						<p className="break-words text-sm leading-relaxed text-muted-foreground">{account.description}</p>
					)}
					<div className="grid grid-cols-1 gap-3 @[18rem]:grid-cols-2">
						<div>
							<div className="text-2xs text-tertiary-foreground">Normal balance</div>
							<div className="text-sm capitalize text-foreground">{account.normalBalance}</div>
						</div>
						<div>
							<div className="text-2xs text-tertiary-foreground">Status</div>
							<div className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
								<ToneDot tone={active ? "green" : "neutral"} />
								{active ? "Active" : "Inactive"}
								{onActiveChange && (
									<IconButton
										variant="skeleton"
										size="sm"
										className="ml-auto"
										icon={<PowerIcon weight="bold" />}
										onClick={() => onActiveChange(!active)}
									>
										{active ? "Deactivate" : "Activate"}
									</IconButton>
								)}
							</div>
						</div>
					</div>
					{flags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{flags.map((f) => (
								<Badge key={f} variant="muted" size="sm">
									{f}
								</Badge>
							))}
						</div>
					)}
				</div>

				{balanceHistory.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>Balance history</SectionLabel>
						<DataList
							caption="Balance history"
							columns={BALANCE_HISTORY_COLUMNS}
							rows={balanceHistory.slice(0, 6)}
							getKey={(h) => h.period}
							dense
							stackBelow="lg"
						/>
					</div>
				)}

				{transactions.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>Recent transactions</SectionLabel>
						<div className="flex flex-col gap-3">
							{transactions.slice(0, 10).map((t) => (
								<div key={t.id} className="flex items-start gap-2">
									<div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-tertiary-foreground">
										{t.type === "debit" ? (
											<ArrowUpIcon weight="bold" size={12} aria-hidden="true" />
										) : (
											<ArrowDownIcon weight="bold" size={12} aria-hidden="true" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="break-words text-sm text-foreground">{t.description || "No description"}</div>
										<div className="text-2xs text-tertiary-foreground">
											{formatDate(t.date)}
											{t.source && ` · ${t.source}`}
										</div>
									</div>
									<span className="shrink-0 text-sm tabular-nums text-foreground">
										{formatPlain(t.amount)}
										<span className="ml-1 text-2xs text-tertiary-foreground">{t.type === "debit" ? "Dr" : "Cr"}</span>
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{transactions.length === 0 && transactionCount === 0 && (
					<div className="flex flex-col items-center gap-1.5 py-4 text-sm text-tertiary-foreground">
						<ClockIcon size={16} weight="fill" aria-hidden="true" />
						No activity yet
					</div>
				)}

				{account.mappingKeywords && account.mappingKeywords.length > 0 && (
					<div className="flex flex-col gap-2">
						<SectionLabel>AI Mapping Keywords</SectionLabel>
						<div className="flex flex-wrap gap-1">
							{account.mappingKeywords.map((k) => (
								<Badge key={k} variant="muted" size="sm">
									{k}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
