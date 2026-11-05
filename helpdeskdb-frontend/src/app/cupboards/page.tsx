"use client";

import { useTranslation } from "react-i18next";
import { cupboardService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";
import { useCupboards, useRooms } from "@/hooks/queries/entityQueries";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { qk } from "@/lib/queryKeys";
import { ICupboard, ICupboardAdd } from "@/types/domain/DomainTypes";
import { toOptions } from "@/components/dialogs/common/entityDialogTypes";
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
	cupboardDeleteSummary,
	cupboardFormConfig,
	cupboardToForm,
} from "@/components/dialogs/entityConfigs/cupboard";

export default function Cupboards() {
	const { t: tCupboard } = useTranslation("cupboard");
	const { t: tCommon } = useTranslation("common");
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");

	const { canManage } = usePermissions();

	const { data: cupboards = [], error } = useCupboards();
	// Reference list for the dialog's Room select and the list's Room column.
	const { data: rooms = [] } = useRooms();

	const crud = useEntityCrud<ICupboard, ICupboardAdd>({
		service: cupboardService,
		// overviewRoot embeds the joined cupboardName.
		invalidateKeys: [qk.cupboards(), qk.overviewRoot()],
	});

	const options = { rooms: toOptions(rooms, (r) => r.roomName) };
	const roomNameById = new Map(rooms.map((room) => [room.id, room.roomName]));

	const columns = [
		tCupboard("CodeName"),
		tAssetViewModel("RoomName"),
		...(canManage ? [tCommon("Actions")] : []),
	];

	const rows = cupboards.map((item) => ({
		id: item.id,
		cells: [
			item.codeName,
			roomNameById.get(item.roomId) ?? "-",
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
			title={tCupboard("Cupboards")}
			createButton={canManage && <CreateButton onClick={crud.openCreate} />}
		>
			<ErrorBanner error={error} />
			<DataTable columns={columns} rows={rows} />

			<EntityFormDialog
				mode="create"
				config={cupboardFormConfig}
				options={options}
				{...crud.createDialogProps}
			/>

			<EntityEditDialog
				config={cupboardFormConfig}
				toForm={cupboardToForm}
				options={options}
				{...crud.editDialogProps}
			/>

			<EntityDeleteDialog
				namespace={cupboardFormConfig.namespace}
				singularKey={cupboardFormConfig.singularKey}
				summaryFields={cupboardDeleteSummary}
				{...crud.deleteDialogProps}
			/>
		</ListPageWrapper>
	);
}
