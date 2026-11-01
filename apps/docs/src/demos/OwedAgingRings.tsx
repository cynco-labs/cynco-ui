import { OwedAgingRings } from "@cynco-labs/ui";

export default function OwedAgingRingsDemo() {
	return (
		<div className="max-w-[460px]">
			<OwedAgingRings
				dso={38}
				receivables={{
					current: 64850,
					days1to30: 18200,
					days31to60: 7650,
					days61to90: 3400,
					over90: 2200,
				}}
				payables={{ current: 39800, days1to30: 8940.6, days31to60: 2500, days61to90: 0, over90: 0 }}
			/>
		</div>
	);
}
