import { ShortcutButton } from "@cynco-labs/ui";

export default function ShortcutButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<ShortcutButton metaShortcut="enter">Save changes</ShortcutButton>
			<ShortcutButton variant="secondary" singleShortcut="n">
				New invoice
			</ShortcutButton>
		</div>
	);
}
