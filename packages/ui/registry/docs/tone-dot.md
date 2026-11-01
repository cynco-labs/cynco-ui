# ToneDot

A 6px dot (or square) in one of Cynco UI's status tones; toneBg exposes the same background classes for bars and legend keys.

```tsx
import { ToneDot } from "@cynco-labs/ui";
```

## Usage

```tsx
import { ToneDot } from "@cynco-labs/ui";

const tones = ["green", "blue", "amber", "orange", "red", "purple", "neutral"];

export default function ToneDotDemo() {
	return (
		<div className="flex flex-col gap-2 text-sm text-foreground">
			<div className="flex flex-wrap items-center gap-2">
				{tones.map((t) => (
					<span key={t} className="inline-flex items-center gap-1.5">
						<ToneDot tone={t} />
						{t}
					</span>
				))}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{tones.map((t) => (
					<span key={t} className="inline-flex items-center gap-1.5">
						<ToneDot tone={t} square />
						{t}
					</span>
				))}
			</div>
		</div>
	);
}
```

## Use

A small colour cue next to text that already says the state (account type, autosave, aging bucket).

## Props

tone, square, className and any span props (title for a hover hint).

## Notes

Decorative (aria-hidden): the meaning must also be in nearby text.

Category: Layout · Primitives. Source: `packages/ui/src/layout/index.tsx`.
