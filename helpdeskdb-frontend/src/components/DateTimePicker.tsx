"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";

const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_TIME = "05:00";

/**
 * The calendar window a *new* booking may use: yesterday through 30 days out.
 * Widened to also cover an existing reservation's range, so an edit dialog can
 * re-pick dates already on the record — a reservation that started last week
 * would otherwise open onto a calendar of entirely disabled days.
 */
export function reservationBounds(from?: Date | null, to?: Date | null) {
	const existing = [from, to].filter((d): d is Date => d instanceof Date);
	return {
		minDate: existing.reduce(
			(earliest, d) => (d < earliest ? d : earliest),
			new Date(Date.now() - DAY_MS),
		),
		maxDate: existing.reduce(
			(latest, d) => (d > latest ? d : latest),
			new Date(Date.now() + DAY_MS * 30),
		),
	};
}

interface DateTimePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	/**
	 * Earliest selectable day. Defaults to yesterday — right for booking something
	 * new, but the edit dialogs must widen it to include the reservation's existing
	 * start date, which is usually further in the past and would otherwise be
	 * unpickable (leaving the user stuck on a calendar of disabled days).
	 */
	minDate?: Date;
	/** Latest selectable day. Defaults to 30 days out. */
	maxDate?: Date;
}

export function DateTimePicker({
	value,
	onChange,
	minDate,
	maxDate,
}: DateTimePickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [date, setDate] = useState<Date | null>(value ?? null);
	const [time, setTime] = useState<string>(
		value ? format(value, "HH:mm") : DEFAULT_TIME,
	);

	// Keep local state in sync with the parent-controlled value — including when it
	// goes back to null (useDateRangeForm does that on every open/close). Without the
	// else branch the trigger keeps displaying the old date while the parent holds
	// null, so the dialog shows a date but validation reports BothDatesRequired.
	useEffect(() => {
		if (value) {
			setDate(value);
			setTime(format(value, "HH:mm"));
		} else {
			setDate(null);
			setTime(DEFAULT_TIME);
		}
	}, [value]);

	const handleDateChange = (selectedDate: Date | undefined) => {
		if (!selectedDate) return;

		// Apply current time. Clone first — react-day-picker owns selectedDate.
		const [hours, minutes] = time.split(":");
		const newDate = new Date(selectedDate.getTime());
		newDate.setHours(parseInt(hours), parseInt(minutes));

		setDate(newDate);
		onChange(newDate);
		setIsOpen(false);
	};

	const handleTimeChange = (selectedTime: string) => {
		setTime(selectedTime);
		if (!date) return;

		const [hours, minutes] = selectedTime.split(":");
		const newDate = new Date(date.getTime());
		newDate.setHours(parseInt(hours), parseInt(minutes));
		setDate(newDate);
		onChange(newDate);
	};

	return (
		<div className="flex w-full gap-4">
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-full font-normal",
							!date && "text-muted-foreground",
						)}
					>
						{date ? (
							`${format(date, "PPP")}, ${time}`
						) : (
							<span>Pick a date</span>
						)}
						<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						captionLayout="dropdown"
						selected={date || undefined}
						onSelect={handleDateChange}
						onDayClick={() => setIsOpen(false)}
						startMonth={new Date(2000, 0)}
						endMonth={new Date(new Date().getFullYear(), 11)}
						disabled={(day) =>
							Number(day) <
								(minDate ? Number(minDate) : Date.now() - DAY_MS) ||
							Number(day) >
								(maxDate ? Number(maxDate) : Date.now() + DAY_MS * 30)
						}
						defaultMonth={date ?? undefined}
					/>
				</PopoverContent>
			</Popover>

			<Select value={time} onValueChange={handleTimeChange}>
				<SelectTrigger className="font-normal focus:ring-0 w-[120px] focus:ring-offset-0">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<ScrollArea className="h-[15rem]">
						{Array.from({ length: 144 }).map((_, i) => {
							const hour = Math.floor(i / 6)
								.toString()
								.padStart(2, "0");
							const minute = ((i % 6) * 10)
								.toString()
								.padStart(2, "0");
							return (
								<SelectItem key={i} value={`${hour}:${minute}`}>
									{hour}:{minute}
								</SelectItem>
							);
						})}
					</ScrollArea>
				</SelectContent>
			</Select>
		</div>
	);
}
