import { useTranslation } from "react-i18next";
import {
	IAssetViewModel,
	IAssetViewModelRemove,
} from "@/types/domain/IAssetViewModels";
import { ConfirmResult } from "../common/entityDialogTypes";
import { EntityFormDialog } from "../common/EntityFormDialog";
import {
	RemoveAssetForm,
	removeAssetFormConfig,
} from "../entityConfigs/editAssetViewModel";

interface RemoveAssetDialogProps {
	open: boolean;
	asset: IAssetViewModel | null;
	onClose: () => void;
	onConfirm: (removeAsset: IAssetViewModelRemove) => ConfirmResult;
	isLoading: boolean;
}

export const RemoveAssetDialog = ({
	open,
	asset,
	onClose,
	onConfirm,
	isLoading,
}: RemoveAssetDialogProps) => {
	// The comment field's label/placeholder live in "common"; loading the
	// config's own namespace here keeps the title resolvable too.
	useTranslation("remove");

	// The page owns the try/catch and hands the message back through
	// ConfirmResult, so this only has to map form values to the DTO.
	const handleConfirm = async (form: RemoveAssetForm) => {
		if (!asset) return;
		return onConfirm({ assetId: asset.id, comment: form.comment });
	};

	if (!asset) return null;

	return (
		<EntityFormDialog
			open={open}
			mode="create"
			config={removeAssetFormConfig}
			subtitle={asset.assetName}
			onClose={onClose}
			onConfirm={handleConfirm}
			isLoading={isLoading}
		/>
	);
};
