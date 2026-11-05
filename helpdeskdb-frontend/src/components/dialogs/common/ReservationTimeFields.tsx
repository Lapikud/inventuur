import { DateTimePicker } from "@/components/DateTimePicker";

interface ReservationTimeFieldsProps {
	/**
	 * Already-translated labels — the dialogs using these fields split across
	 * the "assetreservation" and "changeReservationTime" namespaces.
	 */
	fromLabel: string;
	toLabel: string;
	from: Date | null;
	to: Date | null;
	onFromChange: (date: Date | null) => void;
	onToChange: (date: Date | null) => void;
	/**
	 * Bounds for both pickers. Omit for a new booking (the picker's own
	 * yesterday→+30d window applies); the edit dialogs pass
	 * `reservationBounds(from, to)` so dates already on the record stay
	 * selectable.
	 */
	minDate?: Date;
	maxDate?: Date;
}

/** The reservation from/to picker pair shared by every date-range dialog. */
export const ReservationTimeFields = ({
	fromLabel,
	toLabel,
	from,
	to,
	onFromChange,
	onToChange,
	minDate,
	maxDate,
}: ReservationTimeFieldsProps) => (
	<>
		<div className="mb-4">
			<label htmlFor="reservation-from" className="block text-gray-700 mb-2">
				{fromLabel}
			</label>
			<DateTimePicker
				id="reservation-from"
				value={from}
				onChange={onFromChange}
				minDate={minDate}
				maxDate={maxDate}
			/>
		</div>
		<div className="mb-4">
			<label htmlFor="reservation-to" className="block text-gray-700 mb-2">
				{toLabel}
			</label>
			<DateTimePicker
				id="reservation-to"
				value={to}
				onChange={onToChange}
				minDate={minDate}
				maxDate={maxDate}
			/>
		</div>
	</>
);
