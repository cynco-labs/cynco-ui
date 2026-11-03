"use client";

import { CaretDownIcon, CaretLeftIcon, CaretRightIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { cn } from "../../lib/utils";
import { setMonth, setYear } from "date-fns";
import type * as React from "react";
import {
	type ChevronProps,
	DayPicker,
	defaultLocale,
	type MonthCaptionProps,
	useDayPicker,
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

const NAV_BUTTON =
	"inline-flex items-center justify-center size-7 rounded-md text-tertiary-foreground hover:bg-accent hover:text-foreground transition-colors p-0 outline-none focus-ring disabled:opacity-30 disabled:pointer-events-none aria-disabled:opacity-30 aria-disabled:pointer-events-none";

const CHEVRONS = { left: CaretLeftIcon, right: CaretRightIcon, up: CaretUpIcon, down: CaretDownIcon };

function Chevron({ orientation = "left", className, size, style }: ChevronProps) {
	const Icon = CHEVRONS[orientation];
	return <Icon aria-hidden="true" className={cn("size-4", className)} size={size} style={style} />;
}

/** Fixed-width month and year triggers keep the popover from resizing, so the arrows never move under the cursor. */
function CalendarCaption({ calendarMonth, displayIndex: _displayIndex, id }: MonthCaptionProps) {
	const { goToMonth, previousMonth, nextMonth, labels, formatters, dayPickerProps } = useDayPicker();
	const { startMonth, endMonth } = dayPickerProps;
	// The same locale DayPicker resolves for itself: its partial override over English.
	const locale = { ...defaultLocale, ...dayPickerProps.locale };
	const displayMonth = calendarMonth.date;
	// react-day-picker's own labels, so a localised DayPicker stays localised here.
	const monthLabel = labels.labelMonthDropdown({ locale }).replace(/:\s*$/, "");
	const yearLabel = labels.labelYearDropdown({ locale }).replace(/:\s*$/, "");

	const startYear = startMonth?.getFullYear() ?? displayMonth.getFullYear() - 5;
	const endYear = endMonth?.getFullYear() ?? displayMonth.getFullYear() + 5;
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
				aria-label={labels.labelPrevious(previousMonth)}
				disabled={!previousMonth}
				onClick={() => previousMonth && goToMonth(previousMonth)}
				className={NAV_BUTTON}
			>
				<CaretLeftIcon aria-hidden="true" className="size-4" />
			</button>

			<div className="flex items-center gap-1.5">
				<Select
					value={String(displayMonth.getMonth())}
					onValueChange={(v) => goToMonth(setMonth(displayMonth, Number(v)))}
					items={MONTHS.map((name, i) => ({ value: String(i), label: name }))}
				>
					<SelectTrigger aria-label={monthLabel} className="h-7 w-[7.25rem] justify-between border-none shadow-none px-2 text-sm font-medium text-foreground hover:bg-accent gap-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{MONTHS.map((name, i) => (
							<SelectItem key={name} value={String(i)}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={String(displayMonth.getFullYear())}
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
				className={NAV_BUTTON}
			>
				<CaretRightIcon aria-hidden="true" className="size-4" />
			</button>
		</div>
	);
}

/**
 * react-day-picker 10 with Cynco styling. `captionLayout="dropdown"` (or `"dropdown-months"` / `"dropdown-years"`)
 * swaps the caption for month and year selects with the arrows beside them; bound the years with `startMonth`
 * and `endMonth`.
 */
function Calendar({
	className,
	classNames,
	components,
	showOutsideDays = true,
	fixedWeeks = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const hasDropdown = props.captionLayout?.startsWith("dropdown") ?? false;

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			// Six rows every month, so paging never changes the popover's height.
			fixedWeeks={fixedWeeks}
			// The dropdown caption carries its own arrows.
			hideNavigation={hasDropdown || props.hideNavigation}
			className={cn("relative w-fit p-3", className)}
			classNames={{
				months: "flex flex-col sm:flex-row gap-2",
				month: "flex flex-col gap-4",
				month_caption: "flex h-7 items-center justify-center",
				caption_label: "text-sm font-medium text-foreground",
				nav: "absolute inset-x-3 top-3 z-10 flex h-7 items-center justify-between",
				button_previous: NAV_BUTTON,
				button_next: NAV_BUTTON,
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday: "text-tertiary-foreground rounded-md w-8 font-normal text-xs",
				week: "flex w-full mt-2",
				day: cn(
					"relative size-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
					props.mode === "range" ? "first:rounded-l-md last:rounded-r-md" : "rounded-md",
				),
				day_button:
					"inline-flex items-center justify-center size-8 p-0 font-normal text-muted-foreground rounded-md cursor-pointer outline-none focus-ring hover:bg-accent hover:text-accent-foreground transition-colors",
				selected:
					"[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
				range_start: "rounded-l-md bg-accent",
				range_end: "rounded-r-md bg-accent",
				range_middle: "bg-accent [&>button]:!bg-transparent [&>button]:!text-accent-foreground",
				today: "[&>button]:font-medium [&:not([aria-selected])>button]:bg-accent [&:not([aria-selected])>button]:text-accent-foreground",
				outside: "[&:not([aria-selected])>button]:text-subtle",
				disabled: "[&>button]:text-subtle [&>button]:opacity-50",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron,
				...(hasDropdown ? { MonthCaption: CalendarCaption } : {}),
				...components,
			}}
			{...props}
		/>
	);
}

export { Calendar };
