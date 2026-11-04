import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@cynco-labs/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function InputGroupDemo() {
	return (
		<div className="max-w-[320px]">
			<InputGroup>
				<InputGroupAddon>
					<MagnifyingGlassIcon size={14} />
				</InputGroupAddon>
				<InputGroupInput placeholder="Search invoices" />
				<InputGroupAddon align="inline-end">
					<InputGroupText>⌘K</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}
