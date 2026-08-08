import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface UseDateRangeFormOptions {
	open: boolean;
	initialFrom?: Date | null;
	initialTo?: Date | null;
}

/**
 * The reservation from/to state every date-range dialog needs: the two
 * pickers' values, the dialog-level error, and the shared validation.
 *
 * Callers that have no initial values (create/reserve) just omit them and
 * get an empty, self-resetting form.
 */
export const useDateRangeForm = ({
	open,
	initialFrom,
	initialTo,
}: UseDateRangeFormOptions) => {
	const { t: tValidation } = useTranslation("validationerrors");

	const [from, setFrom] = useState<Date | null>(null);
	const [to, setTo] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Seeded by time value, not by Date identity: callers build these inline
	// in JSX (overview/page.tsx does), so a Date dep would change on every
	// parent render and wipe the user's in-progress picker edits. Runs on
	// close too, which is what resets the form between openings.
	const initialFromTime = initialFrom?.getTime() ?? null;
	const initialToTime = initialTo?.getTime() ?? null;

	useEffect(() => {
		setFrom(initialFromTime === null ? null : new Date(initialFromTime));
		setTo(initialToTime === null ? null : new Date(initialToTime));
		setError(null);
	}, [open, initialFromTime, initialToTime]);

	/** Returns the validated pair, or null after setting the error message. */
	const validate = (): { from: Date; to: Date } | null => {
		if (!from || !to) {
			setError(tValidation("BothDatesRequired"));
			return null;
		}
		if (to <= from) {
			setError(tValidation("ReservationToMustBeAfterFrom"));
			return null;
		}
		setError(null);
		return { from, to };
	};

	return { from, to, setFrom, setTo, error, setError, validate };
};
