import { ITag, ITagAdd } from "@/types/domain/DomainTypes";
import {
	DeleteSummaryField,
	FormDialogConfig,
} from "../common/entityDialogTypes";

export const tagFormConfig: FormDialogConfig<ITagAdd> = {
	namespace: "tag",
	singularKey: "TagSingular",
	defaultValues: { tagName: "" },
	fields: [
		{
			kind: "text",
			name: "tagName",
			labelKey: "TagName",
			placeholderKey: "TagNamePrompt",
			validation: { required: true, minLength: 2, maxLength: 128 },
		},
	],
};

export const tagToForm = (tag: ITag): ITagAdd => ({
	tagName: tag.tagName,
});

export const tagDeleteSummary: DeleteSummaryField<ITag>[] = [
	{ labelKey: "TagName", render: (t) => t.tagName },
];
