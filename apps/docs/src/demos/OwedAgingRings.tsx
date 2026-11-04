import { OwedAgingRings } from "@cynco-labs/ui";

export default function OwedAgingRingsDemo() {
	return (
		<div className="max-w-[460px]">
			<OwedAgingRings
				dso={38}
				receivables={{
					current: "64850.00",
					days1to30: "18200.00",
					days31to60: "7650.00",
					days61to90: "3400.00",
					over90: "2200.00",
				}}
				payables={{ current: "39800.00", days1to30: "8940.60", days31to60: "2500.00", days61to90: "0.00", over90: "0.00" }}
			/>
		</div>
	);
}
