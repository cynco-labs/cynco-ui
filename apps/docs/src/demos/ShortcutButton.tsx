import { Label, ShortcutButton, Switch, useCharacterKeyShortcuts } from "@cynco-labs/ui";

export default function ShortcutButtonDemo() {
	// The same switch ShortcutsDialog shows: bare-letter shortcuts like "n" stop firing and lose
	// their keycap when it's off; ⌘/Ctrl chords are unaffected.
	const [characterKeys, setCharacterKeys] = useCharacterKeyShortcuts();
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<ShortcutButton metaShortcut="enter">Save changes</ShortcutButton>
				<ShortcutButton variant="secondary" singleShortcut="n">
					New invoice
				</ShortcutButton>
			</div>
			<Label>
				<Switch checked={characterKeys} onCheckedChange={setCharacterKeys} />
				Single-key shortcuts
			</Label>
		</div>
	);
}
