import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { useDateRangeForm } from "@/hooks/useDateRangeForm";
import { IReserveAssetPayload } from "@/types/domain/DomainTypes";
import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { ConfirmResult } from "../common/entityDialogTypes";
import { Modal } from "../common/Modal";
import { ModalFooter } from "../common/ModalFooter";
import { ReservationTimeFields } from "../common/ReservationTimeFields";

interface ReserveAssetDialogProps {
	open: boolean;
	asset: IAssetViewModel | null;
	onClose: () => void;
	onConfirm: (reserveAsset: IReserveAssetPayload) => ConfirmResult;
	isLoading: boolean;
}

export const ReserveAssetDialog = ({
	open,
	asset,
	onClose,
	onConfirm,
	isLoading,
}: ReserveAssetDialogProps) => {
	const { t: tReserve } = useTranslation("reserve");
	const { t: tAssetReservation } = useTranslation("assetreservation");

	const dates = useDateRangeForm({ open });

	const handleSubmit = async () => {
		if (!asset) return;

		const range = dates.validate();
		if (!range) return;

		// The page clears the selection on success, which closes this dialog;
		// on failure it hands the message back to render inline.
		const result = await onConfirm({
			assetId: asset.id,
			reservationFrom: range.from.toISOString(),
			reservationTo: range.to.toISOString(),
		});

		if (result && result.error) {
			dates.setError(result.error);
		}
	};

	if (!asset) return null;

	return (
		<Modal open={open} onClose={onClose} closeDisabled={isLoading}>
			<h3 className="font-bold text-xl mb-2 text-black">
				{tReserve("ReserveConfirmQuestion")}
			</h3>
			<h3 className="font-bold text-lg mb-4 text-black">
				{asset.assetName}
			</h3>

			<ErrorBanner error={dates.error} variant="dialog" />

			<ReservationTimeFields
				fromLabel={tAssetReservation("ReservationFrom")}
				toLabel={tAssetReservation("ReservationTo")}
				from={dates.from}
				to={dates.to}
				onFromChange={dates.setFrom}
				onToChange={dates.setTo}
			/>

			<ModalFooter
				onCancel={onClose}
				onConfirm={handleSubmit}
				isLoading={isLoading}
				confirmLabel={tReserve("ReserveButton")}
				confirmType="button"
			/>
		</Modal>
	);
};
