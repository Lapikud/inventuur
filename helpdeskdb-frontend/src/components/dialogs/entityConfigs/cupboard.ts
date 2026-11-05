import { ICupboard, ICupboardAdd } from "@/types/domain/DomainTypes";
import {
	DeleteSummaryField,
	FormDialogConfig,
} from "../common/entityDialogTypes";

export const cupboardFormConfig: FormDialogConfig<ICupboardAdd> = {
	namespace: "cupboard",
	singularKey: "CupboardSingular",
	defaultValues: { codeName: "", roomId: "" },
	fields: [
		{
			kind: "text",
			name: "codeName",
			labelKey: "CodeName",
			placeholderKey: "CodeNamePrompt",
			validation: { required: true, minLength: 2, maxLength: 128 },
		},
		{
			kind: "select",
			name: "roomId",
			labelKey: "assetviewmodel:RoomName",
			optionsKey: "rooms",
			required: true,
		},
	],
};

export const cupboardToForm = (cupboard: ICupboard): ICupboardAdd => ({
	codeName: cupboard.codeName,
	roomId: cupboard.roomId,
});

export const cupboardDeleteSummary: DeleteSummaryField<ICupboard>[] = [
	{ labelKey: "CodeName", render: (c) => c.codeName },
];
