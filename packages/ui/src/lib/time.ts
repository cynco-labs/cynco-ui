/**
 * Cynco UI — how the library says *when*. One absolute date format and one
 * relative-time ladder, so "3h ago" means the same thing on a quotation card,
 * an activity feed and a report header.
 */
import { parseDate } from "../base/lib/utils";

/** "30 Oct 2026" — the one absolute date format in the library. */
export function formatDate(d: string | Date): string {
	const date = parseDate(d);
	const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${date.getDate()} ${M[date.getMonth()]} ${date.getFullYear()}`;
}

/** Steps of the relative-time ladder, coarsest last. */
export type RelativeTimeUnit = "minute" | "hour" | "day" | "week" | "month";

export type FormatRelativeTimeOptions = {
	/** The instant to measure against. Default: now. */
	now?: Date | number;
	/**
	 * The coarsest unit to say relatively. Anything older prints as an absolute
	 * date instead, so a header reads "Snapshot taken 12 Mar 2026" rather than
	 * "237d ago". Default `"month"`, which never falls back.
	 */
	maxUnit?: RelativeTimeUnit;
};

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const LADDER: RelativeTimeUnit[] = ["minute", "hour", "day", "week", "month"];

/**
 * "just now", "5m ago", "3h ago", "2d ago", "3w ago", "7mo ago" — and the
 * absolute date past `maxUnit`. An unparseable value gives an empty string, and
 * an instant in the future reads as "just now".
 */
export function formatRelativeTime(
	value: string | Date,
	{ now = Date.now(), maxUnit = "month" }: FormatRelativeTimeOptions = {},
): string {
	const at = parseDate(value).getTime();
	if (Number.isNaN(at)) return "";
	const elapsed = (now instanceof Date ? now.getTime() : now) - at;
	if (elapsed < MINUTE) return "just now";

	const coarsest = LADDER.indexOf(maxUnit);
	const minutes = Math.floor(elapsed / MINUTE);
	if (minutes < 60) return `${minutes}m ago`;
	if (coarsest < 1) return formatDate(value);

	const hours = Math.floor(elapsed / HOUR);
	if (hours < 24) return `${hours}h ago`;
	if (coarsest < 2) return formatDate(value);

	const days = Math.floor(elapsed / DAY);
	if (days < 7) return `${days}d ago`;
	if (coarsest < 3) return formatDate(value);

	if (days < 30) return `${Math.floor(days / 7)}w ago`;
	if (coarsest < 4) return formatDate(value);

	return `${Math.floor(days / 30)}mo ago`;
}
