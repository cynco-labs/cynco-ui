# WebPreview

A mini browser: navigation buttons, URL bar, an iframe body and a collapsible console.

```tsx
import { WebPreview } from "@cynco-labs/ui/ai";
```

## Usage

```tsx
import { ArrowsClockwiseIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
	WebPreview,
	WebPreviewConsole,
	WebPreviewNavigation,
	WebPreviewNavigationButton,
	WebPreviewUrl,
} from "@cynco-labs/ui/ai";

export default function WebPreviewDemo() {
	return (
		<WebPreview defaultUrl="https://app.cynco.io/invoices" className="max-w-[620px] h-auto">
			<WebPreviewNavigation>
				<WebPreviewNavigationButton tooltip="Back">
					<CaretRightIcon size={14} style={{ transform: "rotate(180deg)" }} />
				</WebPreviewNavigationButton>
				<WebPreviewNavigationButton tooltip="Reload">
					<ArrowsClockwiseIcon size={14} />
				</WebPreviewNavigationButton>
				<WebPreviewUrl />
			</WebPreviewNavigation>
			<WebPreviewConsole
				logs={[
					{
						level: "log",
						message: "Invoice list mounted",
						timestamp: new Date(2026, 9, 29, 9, 30),
					},
					{
						level: "warn",
						message: "2 invoices have no tax code",
						timestamp: new Date(2026, 9, 29, 9, 31),
					},
				]}
			/>
		</WebPreview>
	);
}
```

## Use

Previewing a page the agent built.

## Props

`defaultUrl`, `onUrlChange`; `WebPreviewNavigation` › `WebPreviewNavigationButton tooltip`, `WebPreviewUrl`; `WebPreviewBody` (iframe); `WebPreviewConsole logs`.

- `defaultUrl?`: `string`. Default `""`.
- `onUrlChange?`: `(url: string) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

The demo leaves out the iframe body.

Category: AI. Source: `packages/ui/src/base/components/ai-elements/web-preview.tsx`.
