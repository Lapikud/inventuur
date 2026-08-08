import {
	ILocation,
	ILocationInCupboard,
	ILocationInCupboardWithNames,
} from "@/types/domain/DomainTypes";
import {
	DeleteSummaryField,
	FormDialogConfig,
	SelectOption,
	toOptions,
} from "../common/entityDialogTypes";

export type LocationInCupboardForm = {
	locationId: string;
};

export const locationInCupboardFormConfig: FormDialogConfig<LocationInCupboardForm> =
	{
		namespace: "locationincupboard",
		singularKey: "LocationInCupboardSingular",
		defaultValues: { locationId: "" },
		fields: [
			{ kind: "readonly", labelKey: "Cupboard", valueKey: "cupboardCodeName" },
			{
				kind: "select",
				name: "locationId",
				labelKey: "Location",
				optionsKey: "locations",
				required: true,
			},
		],
	};

export const locationsToOptions = (locations: ILocation[]): SelectOption[] =>
	toOptions(locations, (location) => location.locationName);

export const locationInCupboardToForm = (
	entry: ILocationInCupboardWithNames,
): LocationInCupboardForm => ({ locationId: entry.locationId });

// The cupboard is fixed while editing — carry it over rather than letting the
// default `{ id, ...form }` merge drop it.
export const locationInCupboardToUpdate = (
	form: LocationInCupboardForm,
	entity: ILocationInCupboardWithNames,
): ILocationInCupboard => ({
	id: entity.id,
	cupboardId: entity.cupboardId,
	locationId: form.locationId,
});

export const locationInCupboardDeleteSummary: DeleteSummaryField<ILocationInCupboardWithNames>[] =
	[
		{ labelKey: "Cupboard", render: (entry) => entry.codeName },
		{ labelKey: "Location", render: (entry) => entry.locationName },
	];
