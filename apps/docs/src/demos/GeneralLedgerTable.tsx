import { type GlRegisterRow, GeneralLedgerTable, fromSen, toSen } from "@cynco-labs/ui";

type RawRow = [string, string, string, string | null, number, number, string?, number?];

const RAW: RawRow[] = [
	[
		"2026-10-02",
		"JE-2026-0131",
		"Office rent – October 2026",
		"Menara Seri Properties Sdn Bhd",
		0,
		6500,
	],
	["2026-10-06", "RCT-2026-0088", "Receipt INV-2026-0128", "Syarikat Bina Jaya Sdn Bhd", 12720, 0],
	[
		"2026-10-09",
		"RCT-2026-0091",
		"Receipt INV-2026-0131 (USD)",
		"Lion City Analytics Pte Ltd",
		4200,
		0,
		"USD",
		19740,
	],
	["2026-10-15", "PAY-2026-0412", "EPF contribution – September 2026", "KWSP", 0, 4440],
	[
		"2026-10-15",
		"PAY-2026-0413",
		"SST payment – Jul–Aug 2026",
		"Jabatan Kastam Diraja Malaysia",
		0,
		9640,
	],
	["2026-10-25", "JE-2026-0142", "Net salaries paid – October 2026", null, 0, 15255],
	["2026-10-28", "RCT-2026-0097", "Receipt INV-2026-0142", "Syarikat Bina Jaya Sdn Bhd", 12720, 0],
];

let bal = toSen(182400);
const ROWS: GlRegisterRow[] = RAW.map((r, i) => {
	const base = r[7];
	const d: number = r[6] ? (r[4] ? (base ?? 0) : 0) : r[4],
		c: number = r[6] ? (r[5] ? (base ?? 0) : 0) : r[5];
	bal += toSen(d) - toSen(c);
	return {
		id: "g" + i,
		date: r[0],
		entryNumber: r[1],
		description: r[2],
		counterparty: r[3],
		debit: r[4],
		credit: r[5],
		currency: r[6] ?? "MYR",
		baseDebit: d,
		baseCredit: c,
		runningBalance: Number(fromSen(bal)),
		isReconciled: i < 5,
	};
});

export default function GeneralLedgerTableDemo() {
	return (
		<GeneralLedgerTable
			rows={ROWS}
			baseCurrency="MYR"
			openingBalance={182400}
			openingDate="2026-10-01"
			closingDate="2026-10-31"
		/>
	);
}
