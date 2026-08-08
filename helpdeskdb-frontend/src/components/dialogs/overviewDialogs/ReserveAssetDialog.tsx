import { useContext } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { AccountContext } from "@/context/AccountContext";
import { useDateRangeForm } from "@/hooks/useDateRangeForm";
import { IAssetReservationAdd } from "@/types/domain/DomainTypes";
import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { Modal } from "../common/Modal";
import { ModalFooter } from "../common/ModalFooter";
import { ReservationTimeFields } from "../common/ReservationTimeFields";

interface ReserveAssetDialogProps {
	open: boolean;
	asset: IAssetViewModel | null;
	onClose: () => void;
	onConfirm: (
		assetId: string,
		ReserveAsset: IAssetReservationAdd,
	) => Promise<{ success: boolean; error?: string } | void>;
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
	const { accountInfo } = useContext(AccountContext);

	const dates = useDateRangeForm({ open });

	const handleSubmit = async () => {
		if (!asset) return;

		const range = dates.validate();
		if (!range) return;

		try {
			const result = await onConfirm(asset.id, {
				assetId: asset.id,
				userId: accountInfo?.id ?? "",
				reservationFrom: range.from.toISOString(),
				reservationTo: range.to.toISOString(),
			});

			if (result && result.success === false) {
				dates.setError(result.error || "Reservation failed");
				return;
			}

			onClose();
		} catch (error) {
			console.error("Reserve failed:", error);
			dates.setError("Reserve failed unexpectedly");
		}
	};

	if (!asset) return null;

	return (
		<Modal open={open} onClose={onClose}>
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
