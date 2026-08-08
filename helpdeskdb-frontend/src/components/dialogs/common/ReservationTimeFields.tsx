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
}

/** The reservation from/to picker pair shared by every date-range dialog. */
export const ReservationTimeFields = ({
	fromLabel,
	toLabel,
	from,
	to,
	onFromChange,
	onToChange,
}: ReservationTimeFieldsProps) => (
	<>
		<div className="mb-4">
			<label className="block text-gray-700 mb-2">{fromLabel}</label>
			<DateTimePicker value={from} onChange={onFromChange} />
		</div>
		<div className="mb-4">
			<label className="block text-gray-700 mb-2">{toLabel}</label>
			<DateTimePicker value={to} onChange={onToChange} />
		</div>
	</>
);
