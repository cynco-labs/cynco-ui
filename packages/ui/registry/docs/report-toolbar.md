# ReportToolbar

Report page header with its control cluster: period select grouped by fiscal year, Monthly/YTD or Standard/Extended view, Compare toggle + comparison period, Save snapshot, freshness label and Export menu.

```tsx
import { ReportToolbar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ReportToolbar } from "@cynco-labs/ui";

const periods = [
	"2026-10",
	"2026-09",
	"2026-08",
	"2026-07",
	"2026-06",
	"2026-05",
	"2026-04",
	"2026-03",
	"2026-02",
	"2026-01",
];

export default function ReportToolbarDemo() {
	return (
		<div className="flex flex-col gap-5">
			<ReportToolbar
				title="Profit & loss"
				meta="October 2026 · MYR"
				period="2026-10"
				periods={periods}
				fiscalYearEnd="12-31"
				view="monthly"
				views={[
					{ value: "monthly", label: "Monthly" },
					{ value: "ytd", label: "YTD" },
				]}
				compare
				comparePeriod="2026-09"
				freshness={{ mode: "live", lastPostingAt: "2026-10-30T06:10:00Z" }}
				now="2026-10-30T09:25:00Z"
			/>
			<ReportToolbar
				title="Trial balance"
				meta="As at 31 Oct 2026 · MYR · 11 accounts"
				period="2026-10"
				periods={periods}
				fiscalYearEnd="06-30"
				view="standard"
				views={[
					{ value: "standard", label: "Standard" },
					{ value: "extended", label: "Extended" },
				]}
				compare={false}
				showSaveSnapshot
				freshness={{ mode: "snapshot", takenAt: "2026-10-30T09:12:00Z" }}
				now="2026-10-30T09:25:00Z"
			/>
		</div>
	);
}
```

## Use

Top of every financial statement page (ReportShell header).

## Props

period ('YYYY-MM'), periods[]; optional title, meta, fiscalYearEnd ('MM-DD'), view + views[{value,label}], compare, comparePeriod, showSaveSnapshot, freshness {mode:'live', lastPostingAt} | {mode:'snapshot', takenAt}, now, onExport(format); plus className and native element props (spread on the root).

- `period`: `string`
- `periods`: `string[]`
- `title?`: `ReactNode`
- `meta?`: `ReactNode`. Quiet sub-line, e.g. "October 2026 · MYR".
- `fiscalYearEnd?`: `string | null`. "MM-DD"; groups the period list by fiscal year.
- `view?`: `string`. Current view (P&L Monthly/YTD, TB Standard/Extended).
- `views?`: `{ value: string; label: string }[]`
- `compare?`: `boolean`. Compare toggle; omit to hide it (reports without a comparative).
- `comparePeriod?`: `string`
- `showSaveSnapshot?`: `boolean`
- `freshness?`: `ReportFreshness | null`
- `now?`: `string | number`. Clock for the freshness label (defaults to Date.now()).
- `onExport?`: `(format: "pdf" | "excel") => void`
- Also accepts `ComponentProps<"header">`.

## Notes

Layout splits into title row (freshness + Export at right) and a controls row so it fits 720px. State is local, no router. Responsive: title row and controls row are ActionBars that wrap; selects are w-36 max-w-full.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports.tsx`.
