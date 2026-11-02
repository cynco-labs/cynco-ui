import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { cn } from "../../lib/utils";
import { setMonth, setYear } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import {
	type CaptionProps,
	DayPicker,
	useDayPicker,
	useNavigation,
} from "react-day-picker";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

/** Fixed-width month and year triggers keep the popover from resizing, so the arrows never move under the cursor. */
function CalendarCaption({ displayMonth, id }: CaptionProps) {
	const { goToMonth, previousMonth, nextMonth } = useNavigation();
	const { fromYear, toYear, labels, formatters, locale } = useDayPicker();
	// react-day-picker's own labels, so a localised DayPicker stays localised here.
	const monthLabel = labels.labelMonthDropdown().replace(/:\s*$/, "");
	const yearLabel = labels.labelYearDropdown().replace(/:\s*$/, "");

	const monthValue = String(displayMonth.getMonth());
	const yearValue = String(displayMonth.getFullYear());

	const startYear = fromYear ?? displayMonth.getFullYear() - 5;
	const endYear = toYear ?? displayMonth.getFullYear() + 5;
	const years: number[] = [];
	for (let y = startYear; y <= endYear; y++) years.push(y);

	return (
		<div className="flex items-center justify-between gap-1">
			{/* The month grid is labelled by this id; announces the new month after paging. */}
			<div id={id} className="sr-only" aria-live="polite">
				{formatters.formatCaption(displayMonth, { locale })}
			</div>
			<button
				type="button"
				aria-label={labels.labelPrevious(previousMonth, { locale })}
				disabled={!previousMonth}
				onClick={() => previousMonth && goToMonth(previousMonth)}
				className="inline-flex items-center justify-center size-7 rounded-md text-tertiary-foreground hover:bg-accent hover:text-foreground transition-colors p-0 outline-none focus-ring disabled:opacity-30 disabled:pointer-events-none"
			>
				<ChevronLeft className="size-4" />
			</button>

			<div className="flex items-center gap-1.5">
				<Select
					value={monthValue}
					onValueChange={(v) => goToMonth(setMonth(displayMonth, Number(v)))}
					items={MONTHS.map((name, i) => ({ value: String(i), label: name }))}
				>
					<SelectTrigger aria-label={monthLabel} className="h-7 w-[7.25rem] justify-between border-none shadow-none px-2 text-sm font-medium text-foreground hover:bg-accent gap-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{MONTHS.map((name, i) => (
							<SelectItem key={i} value={String(i)}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={yearValue}
					onValueChange={(v) => goToMonth(setYear(displayMonth, Number(v)))}
				>
					<SelectTrigger aria-label={yearLabel} className="h-7 w-[4.5rem] justify-between border-none shadow-none px-2 text-sm font-medium text-foreground hover:bg-accent gap-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{years.map((y) => (
							<SelectItem key={y} value={String(y)}>
								{y}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<button
				type="button"
				aria-label={labels.labelNext(nextMonth, { locale })}
				disabled={!nextMonth}
				onClick={() => nextMonth && goToMonth(nextMonth)}
				className="inline-flex items-center justify-center size-7 rounded-md text-tertiary-foreground hover:bg-accent hover:text-foreground transition-colors p-0 outline-none focus-ring disabled:opacity-30 disabled:pointer-events-none"
			>
				<ChevronRight className="size-4" />
			</button>
		</div>
	);
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	fixedWeeks = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const hasDropdown =
		props.captionLayout === "dropdown" ||
		props.captionLayout === "dropdown-buttons";

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			// Six rows every month, so paging never changes the popover's height.
			fixedWeeks={fixedWeeks}
			className={cn("p-3", className)}
			classNames={{
				months: "flex flex-col sm:flex-row gap-2",
				month: "flex flex-col gap-4",
				caption: "flex justify-center pt-1 relative items-center w-full",
				caption_label: cn(
					"text-sm font-medium text-foreground",
					hasDropdown && "hidden",
				),
				caption_dropdowns: "flex items-center gap-2",
				// Visually hidden, not display:none: it carries the month name and live updates for screen readers.
				vhidden: "sr-only",
				nav: "flex items-center gap-1",
				nav_button:
					"inline-flex items-center justify-center size-7 rounded-md text-tertiary-foreground hover:bg-accent hover:text-foreground transition-colors p-0 outline-none focus-ring",
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse space-x-1",
				head_row: "flex",
				head_cell:
					"text-tertiary-foreground rounded-md w-8 font-normal text-[0.8rem]",
				row: "flex w-full mt-2",
				cell: cn(
					"relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
					props.mode === "range"
						? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
						: "[&:has([aria-selected])]:rounded-md",
				),
				day: "inline-flex items-center justify-center size-8 p-0 font-normal text-muted-foreground rounded-md cursor-pointer outline-none focus-ring hover:bg-accent hover:text-accent-foreground transition-colors aria-selected:opacity-100",
				day_range_start:
					"day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
				day_range_end:
					"day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
				day_selected:
					"bg-primary !text-primary-foreground hover:bg-primary hover:!text-primary-foreground focus:bg-primary focus:!text-primary-foreground",
				day_today: "bg-accent text-accent-foreground font-medium",
				day_outside: "day-outside text-subtle aria-selected:text-subtle",
				day_disabled: "text-subtle opacity-50",
				day_range_middle:
					"aria-selected:bg-accent aria-selected:!text-accent-foreground",
				day_hidden: "invisible",
				...classNames,
			}}
			components={{
				...(hasDropdown
					? { Caption: CalendarCaption }
					: {
							IconLeft: ({ className, ...props }) => (
								<ChevronLeft className={cn("size-4", className)} {...props} />
							),
							IconRight: ({ className, ...props }) => (
								<ChevronRight className={cn("size-4", className)} {...props} />
							),
						}),
			}}
			{...props}
		/>
	);
}

export { Calendar };
