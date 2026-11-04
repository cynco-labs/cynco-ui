import { PanelButton } from "@cynco-labs/ui";
import { CoinsIcon, CreditCardIcon, LightningIcon } from "@phosphor-icons/react";
import { useState } from "react";

export default function PanelButtonDemo() {
	const [s, setS] = useState(0);
	return (
		<div className="flex flex-wrap items-center gap-2">
			<PanelButton
				isSelected={s === 0}
				onClick={() => {
					setS(0);
				}}
				icon={<CoinsIcon size={20} weight="duotone" />}
				aria-label="Pay by bank transfer"
			/>
			<PanelButton
				isSelected={s === 1}
				onClick={() => {
					setS(1);
				}}
				icon={<LightningIcon size={20} weight="duotone" />}
				aria-label="Pay by DuitNow"
			/>
			<PanelButton
				isSelected={s === 2}
				onClick={() => {
					setS(2);
				}}
				icon={<CreditCardIcon size={20} weight="duotone" />}
				aria-label="Pay by card"
			/>
		</div>
	);
}
