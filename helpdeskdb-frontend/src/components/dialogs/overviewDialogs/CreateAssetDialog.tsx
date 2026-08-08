import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IAssetViewModelCreate } from "@/types/domain/IAssetViewModels";
import { ICategory, ILocation, IOwner } from "@/types/domain/DomainTypes";
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
	onSubmit: (createAsset: IAssetViewModelCreate) => Promise<void>;
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

	const handleConfirm = async (form: CreateAssetForm) => {
		try {
			await onSubmit(createAssetToCreate(form));
		} catch (error) {
			return { error: (error as Error).message };
		}
	};

	return (
		<EntityFormDialog
			open={open}
			mode="create"
			config={createAssetFormConfig}
			options={options}
			onClose={onClose}
			onConfirm={handleConfirm}
			isLoading={isLoading}
		/>
	);
};
