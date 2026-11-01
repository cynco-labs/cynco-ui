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
