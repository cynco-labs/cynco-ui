import { CashRunwayPosition } from "@cynco-labs/ui";

export default function CashRunwayPositionDemo() {
	return (
		<div className="max-w-[520px]">
			<CashRunwayPosition
				cash={184520.4}
				accounts={3}
				runwayMonths={4.6}
				trail={[
					{ label: "May", cash: 121400 },
					{ label: "Jun", cash: 117700 },
					{ label: "Jul", cash: 133300 },
					{ label: "Aug", cash: 146800 },
					{ label: "Sep", cash: 165620 },
					{ label: "Oct", cash: 184520 },
				]}
			/>
		</div>
	);
}
