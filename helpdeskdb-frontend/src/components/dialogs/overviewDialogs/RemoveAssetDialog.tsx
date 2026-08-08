import { useTranslation } from "react-i18next";
import {
	IAssetViewModel,
	IAssetViewModelRemove,
} from "@/types/domain/IAssetViewModels";
import { EntityFormDialog } from "../common/EntityFormDialog";
import {
	RemoveAssetForm,
	removeAssetFormConfig,
} from "../entityConfigs/editAssetViewModel";

interface RemoveAssetDialogProps {
	open: boolean;
	asset: IAssetViewModel | null;
	onClose: () => void;
	onConfirm: (
		assetId: string,
		removeAsset: IAssetViewModelRemove,
	) => Promise<void>;
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

	const handleConfirm = async (form: RemoveAssetForm) => {
		if (!asset) return;
		try {
			await onConfirm(asset.id, {
				assetId: asset.id,
				comment: form.comment,
			});
		} catch (error) {
			return { error: (error as Error).message };
		}
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
