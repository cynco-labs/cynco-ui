"use client";

/**
 * Cynco UI — the vocabulary the accounting components agree on. Anything a
 * reader of two different screens would expect to match lives here: what a bill
 * status is called, how a payment method is spelled, what a failed check looks
 * like, how a list reports what is ticked, what a row menu hands back. Internal
 * to the accounting folder, apart from the status and action names each
 * component re-exports beside the props that use them.
 */
import * as React from "react";
import { type StatusGlyph, type StatusTone, useControllableState } from "../base";
import { type Amount, fromSen, toSen } from "../lib/money";
import type { StatusEntry } from "../lib/shared";

/**
 * The one way an accounting list holds what is ticked: `selectedIds` controls it,
 * `defaultSelectedIds` seeds it, and every change reports the whole new list.
 */
export function useSelection(
	selectedIds: string[] | undefined,
	defaultSelectedIds: string[] | undefined,
	onSelectionChange: ((ids: string[]) => void) | undefined,
) {
	const [ids = [], replace] = useControllableState<string[]>({
		prop: selectedIds,
		defaultProp: defaultSelectedIds ?? [],
		onChange: onSelectionChange,
	});
	const set = new Set(ids);
	// Two toggles in one event (a shift-click range) each read what the other wrote, not the render's copy.
	const latest = React.useRef(ids);
	latest.current = ids;
	return {
		ids: set,
		isSelected: (id: string) => set.has(id),
		toggle: (id: string) => {
			const current = latest.current;
			const next = current.includes(id) ? current.filter((other) => other !== id) : [...current, id];
			latest.current = next;
			replace(next);
		},
		replace,
	};
}

/** What is left to pay, exact and never below zero. */
export function outstandingOf(total: Amount, paid: Amount | null | undefined): string {
	const sen = toSen(total) - toSen(paid);
	return fromSen(sen > 0n ? sen : 0n);
}

/** Every state a bill can be in (cynco domain/bill/status.ts). */
export type CyncoBillStatus =
	| "draft"
	| "in_review"
	| "pending_approval"
	| "approved"
	| "awaiting_payment"
	| "partially_paid"
	| "scheduled"
	| "paid"
	| "rejected"
	| "void";

/** cynco domain/bill/status.ts BILL_STATUS_CONFIG, with glyphs. */
export const BILL_STATUS: Record<CyncoBillStatus, StatusEntry> = {
	draft: { label: "Draft", variant: "neutral", glyph: "pencil" },
	in_review: { label: "In Review", variant: "info", glyph: "clock" },
	pending_approval: { label: "Pending Approval", variant: "warning", glyph: "hourglass" },
	approved: { label: "Approved", variant: "success" },
	awaiting_payment: { label: "Awaiting Payment", variant: "warning", glyph: "clock" },
	partially_paid: { label: "Partially Paid", variant: "warning", glyph: "spinner" },
	scheduled: { label: "Scheduled", variant: "info", glyph: "calendar" },
	paid: { label: "Paid", variant: "success" },
	rejected: { label: "Rejected", variant: "error" },
	void: { label: "Void", variant: "neutral", glyph: "ban", strike: true },
};

/** Reads a status that came from the server as one of ours, so an unknown one stays a plain string. */
export function isBillStatus(status: string): status is CyncoBillStatus {
	return status in BILL_STATUS;
}

/**
 * What a consumer is told the user asked for. Ids, not labels, so the copy beside an icon can
 * change without breaking a `switch`. One union per surface that offers a menu of actions.
 */
export type BillAction =
	| "submit_for_review"
	| "approve"
	| "send_for_approval"
	| "reject"
	| "mark_awaiting_payment"
	| "resubmit_for_review"
	| "archive";

export type InvoiceAction =
	| "send_email"
	| "send_reminder"
	| "mark_paid"
	| "download_receipt"
	| "edit_invoice"
	| "create_delivery_order"
	| "view_deliveries"
	| "create_credit_note"
	| "create_debit_note";

export type CustomerAction = "edit" | "manage_contacts" | "delete";

export type VendorAction = "record_payment" | "edit" | "activate" | "deactivate" | "delete";

/** How a payment was made. "Not specified" is `null`, never a sentinel value. */
export const PAYMENT_METHODS = [
	{ value: "bank_transfer", label: "Bank Transfer" },
	{ value: "cash", label: "Cash" },
	{ value: "cheque", label: "Cheque" },
	{ value: "card", label: "Card" },
	{ value: "e_wallet", label: "E-Wallet" },
	{ value: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

/** A phosphor icon, or anything else that takes its props. */
type IconComponent = React.ComponentType<{
	size?: number;
	className?: string;
	"aria-hidden"?: boolean | "true" | "false";
}>;

/** One column of a Kanban board. Boards differ in their columns, never in their shape. */
export type BoardColumnDef<K extends string = string> = {
	key: K;
	label: string;
	Icon: IconComponent;
	/** Shown in place of cards when the column is empty. */
	empty: string;
};

/**
 * How severe a check's result is, across every checklist in the library. A
 * component maps its own status values onto this, so "failing" looks the same
 * on the period close as it does on the business health panel.
 */
export type CheckSeverity = "fail" | "attention" | "advisory" | "pass" | "na";

export const CHECK_SEVERITY: Record<CheckSeverity, { tone: StatusTone; glyph: StatusGlyph; name: string }> = {
	fail: { tone: "red", glyph: "x", name: "Failing" },
	attention: { tone: "amber", glyph: "alert", name: "Needs attention" },
	advisory: { tone: "neutral", glyph: "minus", name: "Advisory" },
	pass: { tone: "green", glyph: "check", name: "Passing" },
	na: { tone: "neutral", glyph: "minus", name: "Not judged" },
};
