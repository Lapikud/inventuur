import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { useDateRangeForm } from "@/hooks/useDateRangeForm";
import {
	IAssetReservation,
	IAssetReservationWithNames,
} from "@/types/domain/DomainTypes";
import { Modal } from "../common/Modal";
import { ModalFooter } from "../common/ModalFooter";
import { ReservationTimeFields } from "../common/ReservationTimeFields";

interface EditAssetReservationDialogProps {
	open: boolean;
	reservation: IAssetReservationWithNames | null;
	onClose: () => void;
	onConfirm: (
		data: IAssetReservation,
	) => Promise<{ error?: string } | void>;
	isLoading: boolean;
}

export const EditAssetReservationDialog = ({
	open,
	reservation,
	onClose,
	onConfirm,
	isLoading,
}: EditAssetReservationDialogProps) => {
	const { t: tChangeReservationTime } = useTranslation("changeReservationTime");

	// The reservation's dates arrive as ISO strings despite the Date type.
	const initialFrom = useMemo(
		() => (reservation ? new Date(reservation.reservationFrom) : null),
		[reservation],
	);
	const initialTo = useMemo(
		() => (reservation ? new Date(reservation.reservationTo) : null),
		[reservation],
	);

	const dates = useDateRangeForm({ open, initialFrom, initialTo });

	const handleSubmit = async () => {
		if (!reservation) return;

		const range = dates.validate();
		if (!range) return;

		const result = await onConfirm({
			id: reservation.id,
			assetId: reservation.assetId,
			userId: reservation.userId,
			reservationFrom: range.from.toISOString() as unknown as Date,
			reservationTo: range.to.toISOString() as unknown as Date,
			isReturned: reservation.isReturned,
		});

		if (result && result.error) {
			dates.setError(result.error);
		}
	};

	if (!reservation) return null;

	return (
		<Modal open={open} onClose={onClose}>
			<h3 className="font-bold text-xl mb-2 text-black">
				{tChangeReservationTime("Title")}
			</h3>
			<h3 className="font-bold text-lg mb-2 text-black">
				{reservation.assetName}
			</h3>

			<ErrorBanner error={dates.error} variant="dialog" />

			<ReservationTimeFields
				fromLabel={tChangeReservationTime("NewReservationFrom")}
				toLabel={tChangeReservationTime("NewReservationTo")}
				from={dates.from}
				to={dates.to}
				onFromChange={dates.setFrom}
				onToChange={dates.setTo}
			/>

			<ModalFooter
				onCancel={onClose}
				onConfirm={handleSubmit}
				isLoading={isLoading}
				confirmLabel={tChangeReservationTime("UpdateTimeButton")}
				confirmType="button"
			/>
		</Modal>
	);
};
