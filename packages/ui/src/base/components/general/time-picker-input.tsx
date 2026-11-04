"use client";

/**
 * Individual time-segment input (hours / minutes / 12hours).
 * Adapted from openstatusHQ/time-picker (MIT).
 */

import type React from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { getArrowByType, getDateByType, type Period, setDateByType, type TimePickerType } from "./time-picker-utils";

const SEGMENT_LABELS: Record<TimePickerType, string> = {
	hours: "Hours",
	"12hours": "Hours",
	minutes: "Minutes",
	seconds: "Seconds",
};

export interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	picker: TimePickerType;
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	period?: Period;
	onRightFocus?: () => void;
	onLeftFocus?: () => void;
}

function TimePickerInput({
	ref,
	className,
	type = "tel",
	value,
	id,
	name,
	date = new Date(new Date().setHours(0, 0, 0, 0)),
	setDate,
	onChange,
	onKeyDown,
	picker,
	period,
	onLeftFocus,
	onRightFocus,
	...props
}: TimePickerInputProps & { ref?: React.Ref<HTMLInputElement> }) {
	const generatedId = useId();
	const [flag, setFlag] = useState(false);
	const [prevIntKey, setPrevIntKey] = useState("0");

	// Allow the user to enter the second digit within 2 seconds,
	// otherwise reset to first-digit entry.
	useEffect(() => {
		if (!flag) return;
		const timer = setTimeout(() => setFlag(false), 2000);
		return () => clearTimeout(timer);
	}, [flag]);

	const calculatedValue = useMemo(() => getDateByType({ date, type: picker }), [date, picker]);

	const calculateNewValue = (key: string) => {
		// For 12-hour mode: if the first digit entered was 0 and the display
		// shows "01", the next keystroke should start a fresh two-digit entry.
		if (picker === "12hours") {
			if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0") {
				return `0${key}`;
			}
		}
		return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		// Leave Tab and modifier shortcuts (paste, select all, submit) to the browser and app.
		if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
		e.preventDefault();

		if (e.key === "ArrowRight") onRightFocus?.();
		if (e.key === "ArrowLeft") onLeftFocus?.();

		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			const step = e.key === "ArrowUp" ? 1 : -1;
			const newValue = getArrowByType({
				value: calculatedValue,
				step,
				type: picker,
			});
			if (flag) setFlag(false);
			const tempDate = new Date(date);
			setDate(
				setDateByType({
					date: tempDate,
					value: newValue,
					type: picker,
					period,
				}),
			);
		}

		if (e.key >= "0" && e.key <= "9") {
			if (picker === "12hours") setPrevIntKey(e.key);
			const newValue = calculateNewValue(e.key);
			if (flag) onRightFocus?.();
			setFlag((prev) => !prev);
			const tempDate = new Date(date);
			setDate(
				setDateByType({
					date: tempDate,
					value: newValue,
					type: picker,
					period,
				}),
			);
		}
	};

	return (
		<input
			data-slot="time-picker-input"
			ref={ref}
			id={id || generatedId}
			name={name || picker}
			aria-label={SEGMENT_LABELS[picker]}
			className={cn(
				"w-8 text-center text-sm tabular-nums caret-transparent",
				"bg-transparent outline-none transition-none",
				"rounded-sm focus-ring focus:bg-interactive-secondary-hover focus:text-foreground",
				className,
			)}
			value={value || calculatedValue}
			onChange={(e) => {
				e.preventDefault();
				onChange?.(e);
			}}
			type={type}
			inputMode="decimal"
			onKeyDown={(e) => {
				onKeyDown?.(e);
				handleKeyDown(e);
			}}
			{...props}
		/>
	);
}

export { TimePickerInput };
