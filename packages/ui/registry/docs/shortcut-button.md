# ShortcutButton

A primary or secondary Button that shows and binds a keyboard shortcut.

```tsx
import { ShortcutButton } from "@cynco-labs/ui";
```

## Usage

```tsx
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
```

## Use

Sheet and dialog submit actions (`metaShortcut="enter"` → ⌘/Ctrl ↵) and page-level "new" actions (`singleShortcut="n"`).

## Props

`children`, `metaShortcut` or `singleShortcut`, `variant` (`primary` · `secondary`), `onClick`, `isLoading`.

## Notes

The shortcut is registered while mounted; the keycap renders inside the button.

Category: Components · Actions. Source: `packages/ui/src/base/components/general/shortcut-button.tsx`.
