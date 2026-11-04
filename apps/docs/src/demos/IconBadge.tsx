import { IconBadge } from "@cynco-labs/ui";
import { ArrowSquareOutIcon, CoinsIcon, UsersIcon } from "@phosphor-icons/react";

export default function IconBadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<IconBadge icon={<CoinsIcon size={12} weight="fill" />}>MYR</IconBadge>
			<IconBadge variant="muted" icon={<UsersIcon size={12} />}>
				Shah Alam
			</IconBadge>
			<IconBadge variant="muted" position="right" rightIcon={<ArrowSquareOutIcon size={12} />}>
				MyInvois
			</IconBadge>
		</div>
	);
}
