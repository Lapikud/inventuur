import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ErrorBanner";
import { AccountContext } from "@/context/AccountContext";
import { useDateRangeForm } from "@/hooks/useDateRangeForm";
import { IAsset, IAssetReservationAdd } from "@/types/domain/DomainTypes";
import { Modal } from "../common/Modal";
import { ModalFooter } from "../common/ModalFooter";
import { ReservationTimeFields } from "../common/ReservationTimeFields";

interface CreateAssetReservationDialogProps {
	open: boolean;
	assets: IAsset[];
	onClose: () => void;
	onConfirm: (
		data: IAssetReservationAdd,
	) => Promise<{ error?: string } | void>;
	isLoading: boolean;
}

export const CreateAssetReservationDialog = ({
	open,
	assets,
	onClose,
	onConfirm,
	isLoading,
}: CreateAssetReservationDialogProps) => {
	const { t: tAssetReservation } = useTranslation("assetreservation");
	const { t: tCommon } = useTranslation("common");
	const { t: tValidation } = useTranslation("validationerrors");
	const { accountInfo } = useContext(AccountContext);

	const [selectedAssetId, setSelectedAssetId] = useState("");

	const dates = useDateRangeForm({ open });

	// The dates reset themselves on every open/close; the asset select is
	// this dialog's own state, so it resets alongside them.
	useEffect(() => {
		setSelectedAssetId("");
	}, [open]);

	const handleSubmit = async () => {
		dates.setError(null);

		if (!accountInfo?.id) {
			dates.setError(
				tValidation("Required", { field: tAssetReservation("UserId") }),
			);
			return;
		}
		if (!selectedAssetId) {
			dates.setError(
				tValidation("Required", { field: tAssetReservation("AssetId") }),
			);
			return;
		}

		const range = dates.validate();
		if (!range) return;

		const result = await onConfirm({
			assetId: selectedAssetId,
			userId: accountInfo.id,
			reservationFrom: range.from.toISOString(),
			reservationTo: range.to.toISOString(),
		});

		if (result && result.error) {
			dates.setError(result.error);
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<h2 className="text-xl font-bold mb-2 text-black">
				{tCommon("CreateTitle")}
			</h2>
			<h4 className="text-lg text-gray-700 mb-4">
				{tAssetReservation("AssetReservationSingular")}
			</h4>

			<ErrorBanner error={dates.error} variant="dialog" />

			<div className="mb-4">
				<label className="block text-gray-700 mb-2">
					{tAssetReservation("AssetId")}
				</label>
				<select
					className="w-full p-2 border border-gray-300 rounded"
					value={selectedAssetId}
					onChange={(e) => setSelectedAssetId(e.target.value)}
				>
					<option value="">{tAssetReservation("AssetIdPrompt")}</option>
					{assets.map((a) => (
						<option key={a.id} value={a.id}>
							{a.assetName}
						</option>
					))}
				</select>
			</div>

			<div className="mb-4">
				<label className="block text-gray-700 mb-2">
					{tAssetReservation("UserId")}
				</label>
				<div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">
					{accountInfo?.name ?? ""}
				</div>
			</div>

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
				confirmLabel={tCommon("CreateButton")}
				confirmType="button"
			/>
		</Modal>
	);
};
