import { ToggleButton } from "@cynco-labs/ui";
import { ChartBarIcon, FunnelSimpleIcon, UsersIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function ToggleButtonDemo() {
	const [chart, setChart] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ToggleButton iconOrientation="left" icon={<ChartBarIcon />} pressed={chart} onPressedChange={setChart}>
				Show chart
			</ToggleButton>
			<ToggleButton iconOrientation="left" icon={<UsersIcon />} defaultPressed={false}>
				Group by customer
			</ToggleButton>
			<ToggleButton icon={<FunnelSimpleIcon />} defaultPressed tooltip="Show filters" />
		</div>
	);
}
