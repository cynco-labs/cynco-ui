# Sources

A "Used N sources" disclosure listing source links.

```tsx
import { Sources } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { Source, Sources, SourcesContent, SourcesTrigger } from "@cynco-labs/ui/ai";

export default function SourcesDemo() {
	return (
		<Sources defaultOpen>
			<SourcesTrigger count={2} />
			<SourcesContent>
				<Source href="https://www.hasil.gov.my" title="LHDN" />
				<Source href="https://github.com/cynco-labs/cynco-ui" title="GitHub" />
			</SourcesContent>
		</Sources>
	);
}
```

## Use

Under answers that searched the web or docs.

## Props

`SourcesTrigger count`, `SourcesContent` › `Source href title`.

## Notes

Collapsible: pass `defaultOpen` to show the list.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/sources.tsx`.
