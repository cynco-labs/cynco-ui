# Card

A `card` surface with header, title, description, action, content and footer slots.

```tsx
import { Card } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@cynco-labs/ui";

export default function CardDemo() {
	return (
		<Card className="max-w-[380px]">
			<CardHeader>
				<CardTitle>Maybank Current</CardTitle>
				<CardDescription>1010-001 · last synced today</CardDescription>
				<CardAction>
					<Badge variant="muted">Primary</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="text-sm font-medium text-muted-foreground">RM 84,215.40 · 14 lines to review</CardContent>
			<CardFooter>
				<Button variant="secondary" size="sm">
					Review lines
				</Button>
			</CardFooter>
		</Card>
	);
}
```

## Use

Grouping related content on a page.

## Props

`CardHeader` › `CardTitle`, `CardDescription`, `CardAction`; `CardContent`; `CardFooter`.

## Notes

Radius `rounded-xl`, 1px `border`, `shadow-sm`.

Category: Components · Data display. Source: `packages/ui/src/base/components/ui/card.tsx:4-12`.
