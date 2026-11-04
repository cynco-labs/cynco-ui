import { describe, expect, test } from "vitest";
import { formatDate, formatRelativeTime } from "./time";

const NOW = new Date("2026-03-12T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

describe("formatRelativeTime", () => {
	test("climbs one ladder from minutes to months", () => {
		expect(formatRelativeTime(ago(30_000), { now: NOW })).toBe("just now");
		expect(formatRelativeTime(ago(5 * MINUTE), { now: NOW })).toBe("5m ago");
		expect(formatRelativeTime(ago(3 * HOUR), { now: NOW })).toBe("3h ago");
		expect(formatRelativeTime(ago(2 * DAY), { now: NOW })).toBe("2d ago");
		expect(formatRelativeTime(ago(10 * DAY), { now: NOW })).toBe("1w ago");
		expect(formatRelativeTime(ago(200 * DAY), { now: NOW })).toBe("6mo ago");
	});

	test("maxUnit prints an absolute date past the unit it names", () => {
		expect(formatRelativeTime(ago(3 * HOUR), { now: NOW, maxUnit: "hour" })).toBe("3h ago");
		expect(formatRelativeTime(ago(2 * DAY), { now: NOW, maxUnit: "hour" })).toBe("10 Mar 2026");
		expect(formatRelativeTime(ago(2 * DAY), { now: NOW, maxUnit: "day" })).toBe("2d ago");
		expect(formatRelativeTime(ago(10 * DAY), { now: NOW, maxUnit: "day" })).toBe("2 Mar 2026");
	});

	test("an instant in the future reads as just now", () => {
		expect(formatRelativeTime(ago(-5 * DAY), { now: NOW })).toBe("just now");
	});

	test("an unparseable value prints nothing", () => {
		expect(formatRelativeTime("not a date", { now: NOW })).toBe("");
	});

	test("takes a Date, and a number for now", () => {
		expect(formatRelativeTime(new Date(NOW.getTime() - 90 * MINUTE), { now: NOW.getTime() })).toBe("1h ago");
	});
});

test("formatDate reads a calendar date as local midnight", () => {
	expect(formatDate("2026-03-12")).toBe("12 Mar 2026");
	expect(formatDate("2026-03")).toBe("1 Mar 2026");
});
