import { IDomainId } from "@/types/IDomainId";
import { ILocation, ILocationAdd } from "@/types/domain/DomainTypes";
import {
	DeleteSummaryField,
	FormDialogConfig,
} from "../common/entityDialogTypes";

export const locationFormConfig: FormDialogConfig<ILocationAdd> = {
	namespace: "location",
	singularKey: "LocationSingular",
	defaultValues: {
		locationName: "",
		shelfNum: 1,
		column: 1,
		roomId: "",
		cupboardId: "",
	},
	fields: [
		{
			kind: "text",
			name: "locationName",
			labelKey: "LocationName",
			placeholderKey: "LocationNamePrompt",
			validation: { required: true, minLength: 2, maxLength: 128 },
		},
		{
			kind: "number",
			name: "shelfNum",
			labelKey: "ShelfNum",
			placeholder: "1",
			validation: { required: true, min: 1, max: 5 },
		},
		{
			kind: "number",
			name: "column",
			labelKey: "Column",
			placeholder: "1",
			validation: { required: true, min: 1, max: 5 },
		},
		{
			kind: "select",
			name: "roomId",
			labelKey: "assetviewmodel:RoomName",
			optionsKey: "rooms",
			required: true,
		},
		{
			// Optional, and narrowed to the picked room via the dependent
			// select mechanism (filterByField + option filterKey).
			kind: "select",
			name: "cupboardId",
			labelKey: "assetviewmodel:CupboardName",
			optionsKey: "cupboards",
			filterByField: "roomId",
		},
	],
};

export const locationToForm = (location: ILocation): ILocationAdd => ({
	locationName: location.locationName,
	shelfNum: location.shelfNum,
	column: location.column,
	roomId: location.roomId,
	cupboardId: location.cupboardId ?? "",
});

/**
 * The update DTO needs a real null for "no cupboard" — the select's form
 * value is "" (EntityEditDialog's default `{ id, ...form }` merge would send
 * the empty string over the wire).
 */
export const locationToUpdate = (
	form: ILocationAdd,
	location: ILocation,
): IDomainId & ILocationAdd => ({
	id: location.id,
	locationName: form.locationName,
	shelfNum: form.shelfNum,
	column: form.column,
	roomId: form.roomId,
	cupboardId: form.cupboardId || null,
});

export const locationDeleteSummary: DeleteSummaryField<ILocation>[] = [
	{ labelKey: "LocationName", render: (l) => l.locationName },
	{ labelKey: "ShelfNum", render: (l) => l.shelfNum },
	{ labelKey: "Column", render: (l) => l.column },
];
