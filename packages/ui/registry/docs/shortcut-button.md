# ShortcutButton

A primary or secondary Button that shows and binds a keyboard shortcut.

```tsx
import { ShortcutButton } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Sheet and dialog submit actions (`metaShortcut="enter"` → ⌘/Ctrl ↵) and page-level "new" actions (`singleShortcut="n"`).

## Props

`children`, `metaShortcut` or `singleShortcut`, `variant` (`primary` · `secondary`), `onClick`, `isLoading`.

## Notes

The shortcut is registered while mounted; the keycap renders inside the button. A bare-letter `singleShortcut` never fires while typing in a field and follows the user's single-key shortcuts switch (WCAG 2.1.4, `useCharacterKeyShortcuts`, set in ShortcutsDialog): when it is off the key stops firing and the keycap and aria-keyshortcuts are dropped. ⌘/Ctrl chords and named keys like Escape always work. The shortcut triggers a real click, so `onClick` and form submit behave exactly as a mouse click.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/shortcut-button.tsx`.
