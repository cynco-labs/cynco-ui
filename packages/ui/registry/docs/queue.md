# Queue

A collapsible queue of pending and completed tasks or messages.

```tsx
import { Queue } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import {
	Queue,
	QueueItem,
	QueueItemContent,
	QueueItemIndicator,
	QueueList,
	QueueSection,
	QueueSectionContent,
	QueueSectionLabel,
	QueueSectionTrigger,
} from "@cynco-labs/ui/ai";

const TASKS: [string, boolean][] = [
	["Import October statement", true],
	["Match 14 receipts", false],
	["Send overdue reminders", false],
];

export default function QueueDemo() {
	return (
		<Queue className="max-w-[460px]">
			<QueueSection defaultOpen>
				<QueueSectionTrigger>
					<QueueSectionLabel count={3} label="Tasks" />
				</QueueSectionTrigger>
				<QueueSectionContent>
					<QueueList>
						{TASKS.map((t) => (
							<QueueItem key={t[0]}>
								<div className="flex items-center gap-2">
									<QueueItemIndicator completed={t[1]} />
									<QueueItemContent completed={t[1]}>{t[0]}</QueueItemContent>
								</div>
							</QueueItem>
						))}
					</QueueList>
				</QueueSectionContent>
			</QueueSection>
		</Queue>
	);
}
```

## Use

Showing what the agent will do next.

## Props

`QueueSection` › `QueueSectionTrigger` › `QueueSectionLabel count label`, `QueueSectionContent` › `QueueList` › `QueueItem` › `QueueItemIndicator completed`, `QueueItemContent`, `QueueItemDescription`, `QueueItemActions`.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/queue.tsx:191-199`.
