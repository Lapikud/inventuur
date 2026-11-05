"use client";

import { useTranslation } from "react-i18next";
import { tagService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";
import { useTags } from "@/hooks/queries/entityQueries";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { qk } from "@/lib/queryKeys";
import { ITag, ITagAdd } from "@/types/domain/DomainTypes";
import ListPageWrapper from "@/components/ListPageWrapper";
import DataTable from "@/components/DataTable";
import ErrorBanner from "@/components/ErrorBanner";
import CreateButton from "@/components/CreateButton";
import {
	ActionCell,
	EditButton,
	DeleteButton,
} from "@/components/TableActions";
import { EntityFormDialog } from "@/components/dialogs/common/EntityFormDialog";
import { EntityEditDialog } from "@/components/dialogs/common/EntityEditDialog";
import { EntityDeleteDialog } from "@/components/dialogs/common/EntityDeleteDialog";
import {
	tagDeleteSummary,
	tagFormConfig,
	tagToForm,
} from "@/components/dialogs/entityConfigs/tag";

export default function Tags() {
	const { t: tTag } = useTranslation("tag");
	const { t: tCommon } = useTranslation("common");

	const { canManage } = usePermissions();

	const { data = [], error } = useTags();
	const crud = useEntityCrud<ITag, ITagAdd>({
		service: tagService,
		// overviewRoot: IAssetViewModel embeds the joined tag names.
		invalidateKeys: [qk.tags(), qk.overviewRoot()],
	});

	const columns = [
		tTag("TagName"),
		...(canManage ? [tCommon("Actions")] : []),
	];

	const rows = data.map((item) => ({
		id: item.id,
		cells: [
			item.tagName,
			...(canManage
				? [
						<ActionCell key="actions">
							<EditButton
								label={tCommon("EditLink")}
								onClick={() => crud.openEdit(item)}
							/>
							<DeleteButton
								label={tCommon("DeleteLink")}
								onClick={() => crud.openDelete(item)}
							/>
						</ActionCell>,
					]
				: []),
		],
	}));

	return (
		<ListPageWrapper
			title={tTag("Tags")}
			createButton={canManage && <CreateButton onClick={crud.openCreate} />}
		>
			<ErrorBanner error={error} />
			<DataTable columns={columns} rows={rows} />

			<EntityFormDialog
				mode="create"
				config={tagFormConfig}
				{...crud.createDialogProps}
			/>

			<EntityEditDialog
				config={tagFormConfig}
				toForm={tagToForm}
				{...crud.editDialogProps}
			/>

			<EntityDeleteDialog
				namespace={tagFormConfig.namespace}
				singularKey={tagFormConfig.singularKey}
				summaryFields={tagDeleteSummary}
				{...crud.deleteDialogProps}
			/>
		</ListPageWrapper>
	);
}
