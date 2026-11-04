# BusinessHealthPanel

The controls checklist: each check's verdict, one line of evidence and its area (Books, Collections, Payables, Compliance), failures first, with a summary like '2 of 5 checks need you'.

```tsx
import { BusinessHealthPanel } from "@cynco-labs/ui";
```

## Usage

```tsx
import { BusinessHealthPanel, type HealthCheck } from "@cynco-labs/ui";

const checks: HealthCheck[] = [
	{
		id: "close",
		label: "Sep 2026 can close",
		detail: "2 bank transactions still unmatched",
		area: "books",
		status: "warn",
	},
	{
		id: "bank",
		label: "Bank is reconciled",
		detail: "Maybank current account reconciled to 30 Oct",
		area: "books",
		status: "pass",
	},
	{
		id: "ar",
		label: "Receivables are current",
		detail: "RM 31,450.00 overdue · Kopi Kampung Trading 90+ days",
		area: "collections",
		status: "fail",
	},
	{
		id: "dso",
		label: "Collecting inside 45 days",
		detail: "38 days sales outstanding",
		area: "collections",
		status: "pass",
	},
	{
		id: "bills",
		label: "Bills paid on time",
		detail: "Nothing due this week",
		area: "payables",
		status: "pass",
	},
	{
		id: "sst",
		label: "SST-02 (Sep–Oct) filed",
		detail: "Due 30 Nov 2026",
		area: "compliance",
		status: "na",
	},
];

export default function BusinessHealthPanelDemo() {
	return (
		<div className="max-w-[560px]">
			<BusinessHealthPanel checks={checks} />
		</div>
	);
}
```

## Use

Dashboard 'Checks' pane — the CFO's to-do for today.

## Props

checks [{id, label, detail, area, status: fail|warn|pass|na, href?}] or null (unavailable); plus className and native element props (spread on the root).

- `checks`: `HealthCheck[] | null`
- Also accepts `ComponentProps<"section">`.

## Notes

Responsive: area tag hides below 24rem; evidence line wraps instead of truncating on narrow containers.

Category: Accounting · Reports. Source: `packages/ui/src/accounting/reports/health-checks.tsx:56-109`.
