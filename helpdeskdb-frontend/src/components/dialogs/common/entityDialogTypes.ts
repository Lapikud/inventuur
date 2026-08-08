import { ReactNode } from "react";
import { DefaultValues, FieldValues, Path } from "react-hook-form";

export type ConfirmResult = Promise<{ error?: string } | void>;

export interface SelectOption {
	value: string;
	label: string;
}

/** Maps an entity list to select options; `label` picks the display field. */
export const toOptions = <T extends { id: string }>(
	items: T[] | undefined,
	label: (item: T) => string,
): SelectOption[] =>
	(items ?? []).map((item) => ({ value: item.id, label: label(item) }));

// Declarative validation rules; the generic dialog turns these into
// react-hook-form rules with the standard "validationerrors" messages.
export interface ValidationSpec {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

// Label/placeholder keys resolve in the config's entity namespace by
// default; use an "ns:Key" prefix (e.g. "common:Comment") to target
// another namespace.
export type FieldSpec<TForm extends FieldValues> =
	| {
			kind: "text";
			name: Path<TForm>;
			labelKey: string;
			placeholderKey?: string;
			// Renders a <textarea> instead of a single-line <input>.
			multiline?: boolean;
			validation?: ValidationSpec;
	  }
	| {
			kind: "number";
			name: Path<TForm>;
			labelKey: string;
			placeholder?: string;
			validation?: ValidationSpec;
	  }
	| {
			kind: "select";
			name: Path<TForm>;
			labelKey: string;
			// Key into the `options` prop of EntityFormDialog — option lists
			// are dynamic, so they come from the caller, not the config.
			optionsKey: string;
			required?: boolean;
			// "common" namespace key for the empty-option article,
			// e.g. "SelectAn"; defaults to "SelectA".
			selectArticleKey?: string;
	  }
	| {
			// Static text block (delete-summary styling), e.g. the asset name
			// in an edit dialog. Value comes from the `staticValues` prop.
			kind: "display";
			labelKey: string;
			valueKey: string;
	  }
	| {
			// Read-only context field (e.g. the parent cupboard in a join
			// dialog). Not registered on the form; value comes from the
			// `staticValues` prop of EntityFormDialog.
			kind: "readonly";
			labelKey: string;
			valueKey: string;
	  };

// The optional key overrides below resolve in `namespace`, same "ns:Key"
// prefix rule as labelKey. Omitted, they fall back to the "common"
// Create/Edit/Delete wording, which is what every entity CRUD page uses.
export interface FormDialogConfig<TForm extends FieldValues> {
	namespace: string;
	// Subtitle key (the entity's type). Omit for dialogs that head with the
	// entity's own name instead — they pass EntityFormDialog's `subtitle`.
	singularKey?: string;
	// Overrides "common:CreateTitle" / "common:EditTitle".
	titleKey?: string;
	// Overrides "common:CreateButton" / "common:SaveButton".
	confirmLabelKey?: string;
	// Red confirm button, for form dialogs that destroy something.
	destructive?: boolean;
	fields: FieldSpec<TForm>[];
	defaultValues: DefaultValues<TForm>;
}

export interface DeleteSummaryField<TEntity> {
	labelKey: string;
	render: (entity: TEntity) => ReactNode;
	// Half-width: pairs up with the next `half` field in the summary grid.
	half?: boolean;
}
