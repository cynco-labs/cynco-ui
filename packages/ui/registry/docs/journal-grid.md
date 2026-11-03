# JournalGrid

A keyboard-first journal line editor: searchable Account, Description, Debit and Credit cells with spreadsheet movement, auto-balance and a sticky footer showing Total Dr, Total Cr and whether the entry balances.

```tsx
import { JournalGrid } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { Button, JournalGrid, Kbd, type JournalGridLine } from "@cynco-labs/ui";
import type { ReactNode } from "react";

function Hint(p: { children: ReactNode }) {
	return <p className="text-xs text-tertiary-foreground">{p.children}</p>;
}

function K(k: string) {
	return <Kbd keys={k} className="mx-0.5 align-middle" />;
}

const ACCTS = [
	{ id: "a1", code: "1000-001", name: "Maybank Current Account", type: "asset" },
	{ id: "a2", code: "1000-002", name: "CIMB Business Account", type: "asset" },
	{ id: "a3", code: "1200-001", name: "Trade Receivables", type: "asset" },
	{ id: "a4", code: "2000-001", name: "Trade Payables", type: "liability" },
	{ id: "a5", code: "2100-000", name: "Accrued Salaries", type: "liability" },
	{ id: "a6", code: "2200-000", name: "SST Payable", type: "liability" },
	{ id: "a7", code: "2300-001", name: "EPF Payable", type: "liability" },
	{ id: "a8", code: "2300-002", name: "SOCSO Payable", type: "liability" },
	{ id: "a9", code: "2300-003", name: "EIS Payable", type: "liability" },
	{ id: "a10", code: "2300-004", name: "PCB Payable (LHDN)", type: "liability" },
	{ id: "a11", code: "3100-000", name: "Retained Earnings", type: "equity" },
	{ id: "a12", code: "4000-001", name: "Sales – Consulting Services", type: "revenue" },
	{ id: "a13", code: "6100-000", name: "Salaries & Wages", type: "expense" },
	{ id: "a14", code: "6110-000", name: "EPF Employer Contribution", type: "expense" },
	{ id: "a15", code: "6120-000", name: "SOCSO Employer Contribution", type: "expense" },
	{ id: "a16", code: "6130-000", name: "EIS Employer Contribution", type: "expense" },
	{ id: "a17", code: "6200-000", name: "Office Rent", type: "expense" },
	{ id: "a18", code: "6300-000", name: "Utilities – TNB & Air Selangor", type: "expense" },
];

const PAYROLL: JournalGridLine[] = [
	{
		id: "l1",
		accountId: "a13",
		description: "October 2026 gross salaries (14 staff)",
		debit: "48500.00",
		credit: "",
	},
	{ id: "l2", accountId: "a14", description: "EPF employer 12%", debit: "5820.00", credit: "" },
	{ id: "l3", accountId: "a15", description: "SOCSO employer", debit: "851.50", credit: "" },
	{ id: "l4", accountId: "a16", description: "EIS employer", debit: "97.00", credit: "" },
	{
		id: "l5",
		accountId: "a5",
		description: "Net salaries payable 31 Oct",
		debit: "",
		credit: "38964.50",
	},
	{
		id: "l6",
		accountId: "a7",
		description: "EPF employer + employee",
		debit: "",
		credit: "11155.00",
	},
	{
		id: "l7",
		accountId: "a8",
		description: "SOCSO employer + employee",
		debit: "",
		credit: "1095.00",
	},
	{
		id: "l8",
		accountId: "a9",
		description: "EIS employer + employee",
		debit: "",
		credit: "194.00",
	},
	{ id: "l9", accountId: "a10", description: "PCB withheld – October", debit: "", credit: "" },
];

export default function JournalGridDemo() {
	const [lines, setLines] = useState(PAYROLL);
	const [narrow, setNarrow] = useState(false);
	const grid = (
		<JournalGrid
			lines={lines}
			onLinesChange={setLines}
			accounts={ACCTS}
			currency="MYR"
			aria-label="October payroll accrual"
		/>
	);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="min-w-0">
					<div className="text-sm font-semibold text-foreground">
						JV-2026-1031 · October payroll accrual
					</div>
					<Hint>
						{"Try: Tab through a line, "}
						{K("alt+b")}
						{" on the PCB line, "}
						{K("mod+enter")}
						{" to add, type “61” in Account, or =1200*1.08 in Debit."}
					</Hint>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant={narrow ? "secondary" : "primary"}
						size="sm"
						onClick={() => {
							setNarrow(false);
						}}
						aria-pressed={!narrow}
					>
						Wide
					</Button>
					<Button
						variant={narrow ? "primary" : "secondary"}
						size="sm"
						onClick={() => {
							setNarrow(true);
						}}
						aria-pressed={narrow}
					>
						Narrow 340px
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setLines(PAYROLL);
						}}
					>
						Reset
					</Button>
				</div>
			</div>
			<div
				className={
					(narrow
						? "w-full max-w-[340px] rounded-xl border border-dashed border-border p-2 "
						: "") + "max-h-[490px] overflow-y-auto pb-1"
				}
			>
				{grid}
			</div>
		</div>
	);
}
```

## Use

On the journal entry create/edit screen, and anywhere else lines must balance (opening balances, accrual templates, payroll postings).

## Props

lines / defaultLines ({ id, accountId?, description?, debit?, credit? } with decimal-string amounts), onLinesChange(lines), accounts ({ id, code, name, type }), currency? (default MYR), minLines? (default 2), showShortcuts? (default true), className and native div props. Helper: journalTotals(lines) → { debit, credit, difference }.

- `accounts`: `JournalGridAccount[]`. The chart of accounts for the Account picker.
- `lines?`: `JournalGridLine[]`. Controlled lines.
- `defaultLines?`: `JournalGridLine[]`. Uncontrolled initial lines (default: two blank lines).
- `onLinesChange?`: `(lines: JournalGridLine[]) => void`
- `currency?`: `string`. Default `"MYR"`.
- `minLines?`: `number`. Fewest lines kept; deleting below this clears the line instead. Default 2 (double entry). Default `2`.
- `showShortcuts?`: `boolean`. Show the keyboard legend under the footer. Default true. Default `true`.
- Also accepts `ComponentProps<"div">`.

## Notes

Keys: Tab / Shift+Tab move across cells and wrap to the next/previous line (and leave the grid past the ends); Enter moves down and adds a line on the last one; Shift+Enter up; ↑ ↓ change line in the same column unless the account list is open; mod+Enter adds a line below; mod+Backspace deletes the line (clears it at the minimum); Alt+B, or “=” then Enter in an amount cell, fills the figure that balances the entry; a Debit clears that line's Credit and vice versa, and a negative figure flips sides. Account cell: type a code or name, ↑ ↓ and Enter/Tab to pick, Alt+↓/F4 opens, Esc closes. Totals via sumAmounts; StatusChip shows Balanced / Out by RM x. Responsive: a grid on containers ≥ 36rem, a card per line below that (Debit and Credit side by side, each ≥ 6rem); the footer is sticky to the nearest scroll container.

Category: Productivity. Source: `packages/ui/src/productivity/entry.tsx`.
