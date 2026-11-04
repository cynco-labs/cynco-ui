# AccountingWorkbenchHeader

The slim title bar and metric strip that open every accounting workbench tab (Overview, Journal, Ledger, Periods, Opening Balances).

```tsx
import { AccountingWorkbenchHeader } from "@cynco-labs/ui";
```

## Usage

```tsx
import { AccountingWorkbenchHeader, IconButton } from "@cynco-labs/ui";
import { ArrowSquareOutIcon, PlusIcon } from "@phosphor-icons/react";

export default function AccountingWorkbenchHeaderDemo() {
	return (
		<AccountingWorkbenchHeader
			title="General ledger"
			meta="Kedai Maju Trading Sdn Bhd · FY2026 · 214 accounts · MYR"
			actions={[
				<IconButton key="e" variant="secondary" icon={<ArrowSquareOutIcon />}>
					Export
				</IconButton>,
				<IconButton key="n" variant="primary" icon={<PlusIcon weight="bold" />}>
					New journal entry
				</IconButton>,
			]}
			stats={[
				{ key: "je", label: "Journal entries", value: "142", hint: "October 2026", href: "#" },
				{ key: "dr", label: "Total debits", value: "RM 1,284,560.00", hint: "Posted this period" },
				{
					key: "dft",
					label: "Unposted drafts",
					value: "6",
					status: "warning",
					hint: "2 pending approval",
					href: "#",
				},
				{
					key: "tb",
					label: "Trial balance",
					value: "Balanced",
					status: "success",
					hint: "As at 30 Oct 2026",
				},
			]}
		/>
	);
}
```

## Use

At the top of a ledger or journal screen, to name the tab, give its quiet sub-line and show three to five at-a-glance figures.

## Props

title, meta (e.g. "Company · FY2026 · 214 accounts · MYR"), actions (buttons), stats [{ key, label, value, hint?, href?, status?: success|warning|danger }], className? (merged on the root) and native props.

- `title`: `ReactNode`
- `meta?`: `ReactNode`
- `actions?`: `ReactNode`
- `stats?`: `WorkbenchStat[]`. Default `[]`.
- Also accepts `ComponentProps<"div">`.

## Notes

A workbench title row and a StatGrid in one. Tiles are card surfaces (rounded-xl border bg-card) with `text-2xs` captions and `text-md` tabular values; the single state dot uses the StatusChip tones; linked tiles show a hover arrow. Responsive: tiles are StatGrid/StatTile (auto-fit, values wrap instead of truncating); the action bar wraps under the title when narrow.

Category: Accounting · Ledger. Source: `packages/ui/src/accounting/ledger/workbench-header.tsx:37-104`.
