import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IAssetViewModelCreate } from "@/types/domain/IAssetViewModels";
import { ICategory, ILocation, IOwner } from "@/types/domain/DomainTypes";
import { ConfirmResult } from "../common/entityDialogTypes";
import { EntityFormDialog } from "../common/EntityFormDialog";
import {
	CreateAssetForm,
	categoriesToOptions,
	createAssetFormConfig,
	createAssetToCreate,
	locationsToOptions,
	ownersToOptions,
} from "../entityConfigs/editAssetViewModel";

interface ICreateAssetDialogProps {
	open: boolean;
	categories: ICategory[];
	locations: ILocation[];
	owners: IOwner[];
	onClose: () => void;
	onSubmit: (createAsset: IAssetViewModelCreate) => ConfirmResult;
	isLoading: boolean;
}

export const CreateAssetDialog = ({
	open,
	categories,
	locations,
	owners,
	onClose,
	onSubmit,
	isLoading,
}: ICreateAssetDialogProps) => {
	// The config's title and its category/owner/location labels live in the
	// "createnewasset" and "assetviewmodel" namespaces; load them here so the
	// generic dialog's cross-namespace lookups resolve without relying on the
	// parent page.
	useTranslation(["createnewasset", "assetviewmodel"]);

	const options = useMemo(
		() => ({
			categories: categoriesToOptions(categories),
			owners: ownersToOptions(owners),
			locations: locationsToOptions(locations),
		}),
		[categories, owners, locations],
	);

	// The page owns the try/catch and hands the message back through
	// ConfirmResult, so this only has to map form values to the DTO.
	const handleConfirm = (form: CreateAssetForm) =>
		onSubmit(createAssetToCreate(form));

	return (
		<EntityFormDialog
			open={open}
			mode="create"
			config={createAssetFormConfig}
			options={options}
			scanField="barcode"
			onClose={onClose}
			onConfirm={handleConfirm}
			isLoading={isLoading}
		/>
	);
};
