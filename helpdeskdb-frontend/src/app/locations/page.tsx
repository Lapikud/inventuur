"use client";

import { useTranslation } from "react-i18next";
import { locationService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";
import {
	useCupboards,
	useLocations,
	useRooms,
} from "@/hooks/queries/entityQueries";
import { useEntityCrud } from "@/hooks/useEntityCrud";
import { qk } from "@/lib/queryKeys";
import { ILocation, ILocationAdd } from "@/types/domain/DomainTypes";
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
	locationDeleteSummary,
	locationFormConfig,
	locationToForm,
	locationToUpdate,
} from "@/components/dialogs/entityConfigs/location";

export default function Locations() {
	const { t: tLocation } = useTranslation("location");
	const { t: tCommon } = useTranslation("common");
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");

	const { canManage } = usePermissions();

	const { data: locations = [], error } = useLocations();
	// Reference lists for the dialog selects and the Room/Cupboard columns.
	const { data: rooms = [] } = useRooms();
	const { data: cupboards = [] } = useCupboards();

	const crud = useEntityCrud<ILocation, ILocationAdd>({
		service: locationService,
		// overviewRoot embeds the joined shelfNum/column.
		invalidateKeys: [qk.locations(), qk.overviewRoot()],
	});

	const options = {
		rooms: toOptions(rooms, (r) => r.roomName),
		// filterKey ties each cupboard option to its room, so the dialog's
		// cupboard select only offers cupboards of the picked room.
		cupboards: cupboards.map((cupboard) => ({
			value: cupboard.id,
			label: cupboard.codeName,
			filterKey: cupboard.roomId,
		})),
	};
	const roomNameById = new Map(rooms.map((room) => [room.id, room.roomName]));
	const cupboardNameById = new Map(
		cupboards.map((cupboard) => [cupboard.id, cupboard.codeName]),
	);

	const columns = [
		tLocation("LocationName"),
		tLocation("ShelfNum"),
		tLocation("Column"),
		tAssetViewModel("RoomName"),
		tAssetViewModel("CupboardName"),
		...(canManage ? [tCommon("Actions")] : []),
	];

	const rows = locations.map((item) => ({
		id: item.id,
		cells: [
			item.locationName,
			item.shelfNum,
			item.column,
			roomNameById.get(item.roomId) ?? "-",
			item.cupboardId
				? (cupboardNameById.get(item.cupboardId) ?? "-")
				: "-",
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
			title={tLocation("Locations")}
			createButton={canManage && <CreateButton onClick={crud.openCreate} />}
		>
			<ErrorBanner error={error} />
			<DataTable columns={columns} rows={rows} minWidth="min-w-[600px]" />

			<EntityFormDialog
				mode="create"
				config={locationFormConfig}
				options={options}
				{...crud.createDialogProps}
			/>

			<EntityEditDialog
				config={locationFormConfig}
				toForm={locationToForm}
				toUpdate={locationToUpdate}
				options={options}
				{...crud.editDialogProps}
			/>

			<EntityDeleteDialog
				namespace={locationFormConfig.namespace}
				singularKey={locationFormConfig.singularKey}
				summaryFields={locationDeleteSummary}
				{...crud.deleteDialogProps}
			/>
		</ListPageWrapper>
	);
}
