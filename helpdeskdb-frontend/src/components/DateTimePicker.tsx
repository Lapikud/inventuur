"use client";

import { useState } from "react";

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * The calendar window a *new* booking may use: yesterday through 30 days out.
 * Widened to also cover an existing reservation's range, so an edit dialog can
 * re-pick dates already on the record — a reservation that started last week
 * would otherwise open with its start date unpickable.
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

/**
 * Native datetime-local value: "YYYY-MM-DDTHH:mm". `new Date(...)` parses it as
 * LOCAL time, matching how the old minute-precision picker behaved.
 */
const toLocalInputValue = (date: Date): string => {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface DateTimePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	/**
	 * Earliest selectable moment. Defaults to yesterday — right for booking
	 * something new, but the edit dialogs pass `reservationBounds` so dates
	 * already on the record stay selectable.
	 */
	minDate?: Date;
	/** Latest selectable moment. Defaults to 30 days out. */
	maxDate?: Date;
	/** Wiring for ReservationTimeFields' <label htmlFor>. */
	id?: string;
}

/**
 * A single minute-precision date-time picker. A native
 * <input type="datetime-local"> — no calendar popover dependency, and the
 * mobile OS date pickers come for free.
 */
export function DateTimePicker({
	value,
	onChange,
	minDate,
	maxDate,
	id,
}: DateTimePickerProps) {
	// Compute the default window once per mount, not per render — Date.now()
	// is impure, and the react-hooks rules correctly flag calling it during
	// render. Re-mounts (dialog reopen) recalculate naturally.
	const [defaultBounds] = useState(() => {
		if (minDate && maxDate) return { min: minDate, max: maxDate };
		const now = Date.now();
		return {
			min: minDate ?? new Date(now - DAY_MS),
			max: maxDate ?? new Date(now + DAY_MS * 30),
		};
	});
	const { min, max } = defaultBounds;

	return (
		<input
			id={id}
			type="datetime-local"
			// Same bounds as above: clamps both the picker UI and typing.
			min={toLocalInputValue(min)}
			max={toLocalInputValue(max)}
			value={value ? toLocalInputValue(value) : ""}
			onChange={(e) => {
				if (!e.target.value) {
					onChange(null);
					return;
				}
				const date = new Date(e.target.value);
				if (Number.isNaN(date.getTime())) {
					onChange(null);
					return;
				}
				onChange(date);
			}}
			className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
		/>
	);
}
