# Carousel

Embla carousel with previous/next buttons.

```tsx
import { Carousel } from "@cynco-labs/ui";
```

## Usage

```tsx
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@cynco-labs/ui";

export default function CarouselDemo() {
	return (
		<div className="px-12 max-w-[420px]">
			<Carousel>
				<CarouselContent>
					{["Free", "Pro", "Team", "Enterprise"].map((n) => (
						<CarouselItem key={n} className="basis-1/2">
							<div className="h-20 rounded-lg border bg-card flex items-center justify-center text-main text-sm">
								{n}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	);
}
```

## Use

Document template and onboarding galleries.

## Props

`Carousel opts orientation setApi` › `CarouselContent` › `CarouselItem`, `CarouselPrevious`, `CarouselNext`.

- `opts?`: `CarouselOptions`
- `plugins?`: `CarouselPlugin`
- `orientation?`: `"horizontal" | "vertical"`. Default `"horizontal"`.
- `setApi?`: `(api: CarouselApi) => void`
- Also accepts `ComponentProps<"div">`.

## Notes

Leave horizontal room for the arrow buttons.

Category: Components · Navigation. Source: `packages/ui/src/base/components/ui/carousel.tsx`.
