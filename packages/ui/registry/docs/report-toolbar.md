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
				defaultPeriod="2026-10"
				periods={periods}
				fiscalYearEnd="12-31"
				defaultView="monthly"
				views={[
					{ value: "monthly", label: "Monthly" },
					{ value: "ytd", label: "YTD" },
				]}
				defaultCompare
				defaultComparePeriod="2026-09"
				freshness={{ mode: "live", lastPostingAt: "2026-10-30T06:10:00Z" }}
				now="2026-10-30T09:25:00Z"
			/>
			<ReportToolbar
				title="Trial balance"
				meta="As at 31 Oct 2026 · MYR · 11 accounts"
				defaultPeriod="2026-10"
				periods={periods}
				fiscalYearEnd="06-30"
				defaultView="standard"
				views={[
					{ value: "standard", label: "Standard" },
					{ value: "extended", label: "Extended" },
				]}
				defaultCompare={false}
				onSaveSnapshot={() => {}}
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

- `periods`: `string[]`
- `title?`: `ReactNode`
- `meta?`: `ReactNode`. Quiet sub-line, e.g. "October 2026 · MYR".
- `period?`: `string`. Controlled reporting period (e.g. "2026-03").
- `defaultPeriod?`: `string`. Initial period for uncontrolled use.
- `onPeriodChange?`: `(period: string) => void`. Called when the user changes the reporting period.
- `fiscalYearEnd?`: `string | null`. "MM-DD"; groups the period list by fiscal year.
- `view?`: `string`. Controlled view (P&L Monthly/YTD, TB Standard/Extended).
- `defaultView?`: `string`. Initial view for uncontrolled use.
- `onViewChange?`: `(view: string) => void`. Called when the user switches the report view.
- `views?`: `{ value: string; label: string }[]`
- `compare?`: `boolean`. Controlled compare toggle; omit the prop entirely to hide the Compare button.
- `defaultCompare?`: `boolean`. Initial compare value for uncontrolled use.
- `onCompareChange?`: `(compare: boolean) => void`. Called when the user toggles the compare mode.
- `comparePeriod?`: `string`. Controlled comparison period.
- `defaultComparePeriod?`: `string`. Initial comparison period for uncontrolled use.
- `onComparePeriodChange?`: `(period: string) => void`. Called when the user changes the comparison period.
- `onSaveSnapshot?`: `() => void`. Called when the user clicks "Save snapshot"; omit to hide the button.
- `freshness?`: `ReportFreshness | null`
- `now?`: `string | number`. Clock for the freshness label (defaults to Date.now()).
- `onExport?`: `(format: "pdf" | "excel") => void`
- Also accepts `ComponentProps<"header">`.

## Notes

Layout splits into title row (freshness + Export at right) and a controls row so it fits 720px. State is local, no router. Responsive: title row and controls row are ActionBars that wrap; selects are w-36 max-w-full.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports/report-toolbar.tsx:54-268`.
