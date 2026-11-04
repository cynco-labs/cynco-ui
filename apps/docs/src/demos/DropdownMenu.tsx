import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@cynco-labs/ui";
import { CopyIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

export default function DropdownMenuDemo() {
	return (
		<DropdownMenu defaultOpen modal={false}>
			<DropdownMenuTrigger render={<Button variant="secondary" />}>Actions</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-52">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Invoice</DropdownMenuLabel>
					<DropdownMenuItem>
						<PencilSimpleIcon size={14} />
						Edit details
					</DropdownMenuItem>
					<DropdownMenuItem shortcut="C">
						<CopyIcon size={14} />
						Copy invoice no.
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					<TrashIcon size={14} />
					Delete customer
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
