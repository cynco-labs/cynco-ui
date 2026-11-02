import { useState } from "react";
import { ChartBarIcon, FunnelSimpleIcon, UsersIcon } from "@phosphor-icons/react";
import { IconCheckbox } from "@cynco-labs/ui";

export default function IconCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconCheckbox
				variant="secondary"
				iconOrientation="left"
				icon={<ChartBarIcon />}
				checked={s}
				onCheckedChange={setS}
			>
				Show chart
			</IconCheckbox>
			<IconCheckbox variant="secondary" iconOrientation="left" icon={<UsersIcon />} checked={false}>
				Group by customer
			</IconCheckbox>
			<IconCheckbox variant="secondary" icon={<FunnelSimpleIcon />} checked aria-label="Show filters" />
		</div>
	);
}
