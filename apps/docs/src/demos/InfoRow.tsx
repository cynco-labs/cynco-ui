import { InfoRow } from "@cynco-labs/ui";
import { CreditCardIcon, KeyIcon, UserIcon } from "@phosphor-icons/react";

export default function InfoRowDemo() {
	return (
		<div className="flex flex-col gap-1 max-w-[360px]">
			<InfoRow icon={<UserIcon size={14} />} label="Customer" value="Nusantara Logistik Bhd" />
			<InfoRow icon={<KeyIcon size={14} />} label="TIN" value="C10987654320" mono />
			<InfoRow icon={<CreditCardIcon size={14} />} label="Terms" value="Net 30 · RM 12,720.00 due" />
		</div>
	);
}
