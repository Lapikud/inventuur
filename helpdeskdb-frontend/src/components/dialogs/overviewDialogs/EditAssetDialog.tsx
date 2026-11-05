import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	IAssetViewModel,
	IAssetViewModelUpdate,
} from "@/types/domain/IAssetViewModels";
import {
	ICategory,
	ICategoryAsset,
	ILocation,
	IOwner,
	IOwnerAsset,
} from "@/types/domain/DomainTypes";
import { ConfirmResult } from "../common/entityDialogTypes";
import { EntityFormDialog } from "../common/EntityFormDialog";
import {
	EditAssetForm,
	categoriesToOptions,
	editAssetFormConfig,
	editAssetToForm,
	editAssetToUpdate,
	locationsToOptions,
	ownersToOptions,
} from "../entityConfigs/editAssetViewModel";

interface IEditAssetDialogProps {
	open: boolean;
	asset: IAssetViewModel | null;
	comment: string;
	categoryAssets: ICategoryAsset | null;
	ownerAssets: IOwnerAsset | null;
	locations: ILocation[];
	categories: ICategory[];
	owners: IOwner[];
	onClose: () => void;
	onConfirm: (updateAsset: IAssetViewModelUpdate) => ConfirmResult;
	isLoading: boolean;
}

export const EditAssetDialog = ({
	open,
	asset,
	comment,
	categoryAssets,
	ownerAssets,
	locations,
	categories,
	owners,
	onClose,
	onConfirm,
	isLoading,
}: IEditAssetDialogProps) => {
	// The config's category/owner/location labels live in the
	// "assetviewmodel" namespace; load it here so the generic dialog's
	// cross-namespace lookups resolve without relying on the parent page.
	useTranslation("assetviewmodel");

	const options = useMemo(
		() => ({
			categories: categoriesToOptions(categories),
			owners: ownersToOptions(owners),
			locations: locationsToOptions(locations),
		}),
		[categories, owners, locations],
	);

	const initialValues = useMemo(
		() =>
			asset
				? editAssetToForm(asset, comment, categoryAssets, ownerAssets)
				: null,
		[asset, comment, categoryAssets, ownerAssets],
	);

	// The page owns the try/catch and hands the message back through
	// ConfirmResult, so this only has to map form values to the DTO.
	const handleConfirm = async (form: EditAssetForm) => {
		if (!asset) return;
		return onConfirm(
			editAssetToUpdate(form, asset, categoryAssets, ownerAssets),
		);
	};

	return (
		<EntityFormDialog
			open={open}
			mode="edit"
			config={editAssetFormConfig}
			initialValues={initialValues}
			options={options}
			onClose={onClose}
			onConfirm={handleConfirm}
			isLoading={isLoading}
		/>
	);
};
