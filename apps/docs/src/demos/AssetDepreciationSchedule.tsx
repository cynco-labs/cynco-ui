import { AssetDepreciationSchedule } from "@cynco-labs/ui";

export default function AssetDepreciationScheduleDemo() {
	let nbv = 102368.75,
		acc = 46531.25;
	const rows = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"].map(
		(p, i) => {
			acc += 2148.33;
			nbv -= 2148.33;
			return {
				id: "d" + i,
				period: p,
				depreciationAmount: 2148.33,
				accumulatedToDate: acc,
				netBookValueAfter: nbv,
				isPosted: i < 6,
				journalEntryId: i < 5 ? "je" + i : null,
			};
		},
	);
	return <AssetDepreciationSchedule entries={rows} />;
}
