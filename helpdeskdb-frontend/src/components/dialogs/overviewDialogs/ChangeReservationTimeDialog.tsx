import { useContext } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { AccountContext } from "@/context/AccountContext";
import { useDateRangeForm } from "@/hooks/useDateRangeForm";
import { IAssetReservationUpdate } from "@/types/domain/DomainTypes";
import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { ConfirmResult } from "../common/entityDialogTypes";
import { Modal } from "../common/Modal";
import { ModalFooter } from "../common/ModalFooter";
import { ReservationTimeFields } from "../common/ReservationTimeFields";

interface ChangeReservationTimeDialogProps {
	open: boolean;
	assetReservationId: string | null;
	asset: IAssetViewModel | null;
	initialFrom: Date | null;
	initialTo: Date | null;
	onClose: () => void;
	onConfirm: (data: IAssetReservationUpdate) => ConfirmResult;
	isLoading: boolean;
}

export const ChangeReservationTimeDialog = ({
	open,
	assetReservationId,
	asset,
	initialFrom,
	initialTo,
	onClose,
	onConfirm,
	isLoading,
}: ChangeReservationTimeDialogProps) => {
	const { t: tChangeReservationTime } = useTranslation("changeReservationTime");
	const { accountInfo } = useContext(AccountContext);

	const dates = useDateRangeForm({ open, initialFrom, initialTo });

	const handleSubmit = async () => {
		if (!asset || !assetReservationId) return;

		const range = dates.validate();
		if (!range) return;

		const result = await onConfirm({
			assetReservationId,
			assetId: asset.id,
			userId: accountInfo?.id ?? "",
			reservationFrom: range.from,
			reservationTo: range.to,
		});

		if (result && result.error) {
			dates.setError(result.error);
		}
	};

	if (!asset || !assetReservationId) return null;

	return (
		<Modal open={open} onClose={onClose}>
			<h3 className="font-bold text-xl mb-2 text-black">
				{tChangeReservationTime("Title")}
			</h3>
			<h3 className="font-bold text-lg mb-2 text-black">
				{asset.assetName}
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
