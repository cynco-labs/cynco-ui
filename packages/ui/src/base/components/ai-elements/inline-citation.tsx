"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { type ComponentProps, createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "../ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type InlineCitationProps = ComponentProps<"span">;

export const InlineCitation = ({ className, ...props }: InlineCitationProps) => (
	<span className={cn("group inline items-center gap-1", className)} {...props} />
);

export type InlineCitationTextProps = ComponentProps<"span">;

export const InlineCitationText = ({ className, ...props }: InlineCitationTextProps) => (
	<span className={cn("transition-colors group-hover:bg-accent", className)} {...props} />
);

/**
 * A popover, not a hover card: it still opens on hover, and Enter/Space on the trigger opens it and moves
 * focus inside, so keyboard and screen-reader users can reach every source and the carousel (WCAG 2.1.1).
 */
export type InlineCitationCardProps = ComponentProps<typeof Popover>;

export const InlineCitationCard = (props: InlineCitationCardProps) => <Popover {...props} />;

export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
	sources: string[];
};

export const InlineCitationCardTrigger = ({ sources, className, render, ...props }: InlineCitationCardTriggerProps) => (
	<PopoverTrigger
		openOnHover
		render={
			<Badge
				className={cn("ml-1 cursor-pointer rounded-full focus-ring", className)}
				render={render ?? <button type="button" />}
				variant="secondary"
				{...props}
			/>
		}
	>
		{sources[0] ? (
			<>
				{new URL(sources[0]).hostname} {sources.length > 1 && `+${sources.length - 1}`}
			</>
		) : (
			"unknown"
		)}
	</PopoverTrigger>
);

export type InlineCitationCardBodyProps = ComponentProps<typeof PopoverContent>;

export const InlineCitationCardBody = ({ className, ...props }: InlineCitationCardBodyProps) => (
	<PopoverContent aria-label="Citation" className={cn("relative w-80 p-0", className)} {...props} />
);

const CarouselApiContext = createContext<CarouselApi | undefined>(undefined);

const useCarouselApi = () => {
	const context = useContext(CarouselApiContext);
	return context;
};

export type InlineCitationCarouselProps = ComponentProps<typeof Carousel>;

export const InlineCitationCarousel = ({ className, children, ...props }: InlineCitationCarouselProps) => {
	const [api, setApi] = useState<CarouselApi>();

	return (
		<CarouselApiContext.Provider value={api}>
			<Carousel className={cn("w-full", className)} setApi={setApi} {...props}>
				{children}
			</Carousel>
		</CarouselApiContext.Provider>
	);
};

export type InlineCitationCarouselContentProps = ComponentProps<"div">;

export const InlineCitationCarouselContent = (props: InlineCitationCarouselContentProps) => (
	<CarouselContent {...props} />
);

export type InlineCitationCarouselItemProps = ComponentProps<"div">;

export const InlineCitationCarouselItem = ({ className, ...props }: InlineCitationCarouselItemProps) => (
	<CarouselItem className={cn("w-full space-y-2 p-4 pl-8", className)} {...props} />
);

export type InlineCitationCarouselHeaderProps = ComponentProps<"div">;

export const InlineCitationCarouselHeader = ({ className, ...props }: InlineCitationCarouselHeaderProps) => (
	<div className={cn("flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2", className)} {...props} />
);

export type InlineCitationCarouselIndexProps = ComponentProps<"div">;

export const InlineCitationCarouselIndex = ({ children, className, ...props }: InlineCitationCarouselIndexProps) => {
	const api = useCarouselApi();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	return (
		<div
			className={cn("flex flex-1 items-center justify-end px-3 py-1 text-muted-foreground text-xs", className)}
			{...props}
		>
			{children ?? `${current}/${count}`}
		</div>
	);
};

export type InlineCitationCarouselPrevProps = ComponentProps<"button">;

export const InlineCitationCarouselPrev = ({ className, ...props }: InlineCitationCarouselPrevProps) => {
	const api = useCarouselApi();

	const handleClick = useCallback(() => {
		if (api) {
			api.scrollPrev();
		}
	}, [api]);

	return (
		<button aria-label="Previous" className={cn("shrink-0", className)} onClick={handleClick} type="button" {...props}>
			<ArrowLeftIcon className="size-4 text-muted-foreground" />
		</button>
	);
};

export type InlineCitationCarouselNextProps = ComponentProps<"button">;

export const InlineCitationCarouselNext = ({ className, ...props }: InlineCitationCarouselNextProps) => {
	const api = useCarouselApi();

	const handleClick = useCallback(() => {
		if (api) {
			api.scrollNext();
		}
	}, [api]);

	return (
		<button aria-label="Next" className={cn("shrink-0", className)} onClick={handleClick} type="button" {...props}>
			<ArrowRightIcon className="size-4 text-muted-foreground" />
		</button>
	);
};

export type InlineCitationSourceProps = ComponentProps<"div"> & {
	title?: string;
	url?: string;
	description?: string;
};

export const InlineCitationSource = ({
	title,
	url,
	description,
	className,
	children,
	...props
}: InlineCitationSourceProps) => (
	<div className={cn("space-y-1", className)} {...props}>
		{title && <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>}
		{url && (
			<a
				className="block truncate break-all text-muted-foreground text-xs underline-offset-2 hover:underline focus-ring"
				href={url}
				rel="noreferrer"
				target="_blank"
			>
				{url}
			</a>
		)}
		{description && <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">{description}</p>}
		{children}
	</div>
);

export type InlineCitationQuoteProps = ComponentProps<"blockquote">;

export const InlineCitationQuote = ({ children, className, ...props }: InlineCitationQuoteProps) => (
	<blockquote className={cn("border-muted border-l-2 pl-3 text-muted-foreground text-sm italic", className)} {...props}>
		{children}
	</blockquote>
);
