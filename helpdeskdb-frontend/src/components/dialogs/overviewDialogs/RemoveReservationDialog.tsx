import { useTranslation } from "react-i18next";
import { IAssetReservationWithNames } from "@/types/domain/DomainTypes";
import { ConfirmResult } from "../common/entityDialogTypes";
import { EntityDeleteDialog } from "../common/EntityDeleteDialog";
import { removeReservationSummary } from "../entityConfigs/assetReservation";

interface RemoveReservationDialogProps {
	open: boolean;
	reservation: IAssetReservationWithNames | null;
	onClose: () => void;
	onConfirm: (assetId: string) => ConfirmResult;
	isLoading: boolean;
}

export const RemoveReservationDialog = ({
	open,
	reservation,
	onClose,
	onConfirm,
	isLoading,
}: RemoveReservationDialogProps) => {
	// The summary labels live in "assetreservation"; load it so the generic
	// dialog's cross-namespace lookups resolve here.
	useTranslation("assetreservation");

	// The generic dialog hands back the reservation's own id, but the
	// overview's remove-reservation endpoint is keyed by asset id.
	const handleConfirm = async () => {
		if (!reservation) return;
		return onConfirm(reservation.assetId);
	};

	return (
		<EntityDeleteDialog
			open={open}
			entity={reservation}
			namespace="removeReservation"
			subtitle={reservation?.assetName}
			titleKey="Title"
			questionKey="ConfirmQuestion"
			confirmLabelKey="ConfirmButton"
			summaryFields={removeReservationSummary}
			onClose={onClose}
			onConfirm={handleConfirm}
			isLoading={isLoading}
		/>
	);
};
