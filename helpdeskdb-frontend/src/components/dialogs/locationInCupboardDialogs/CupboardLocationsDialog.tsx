import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorBanner from "@/components/ErrorBanner";
import { DeleteButton, EditButton } from "@/components/TableActions";
import {
	useLocations,
	useLocationsInCupboards,
} from "@/hooks/queries/entityQueries";
import { makeConfirmHandler, useEntityCrud } from "@/hooks/useEntityCrud";
import { qk } from "@/lib/queryKeys";
import { locationInCupboardService, locationService } from "@/services";
import { unwrap } from "@/services/errors";
import {
	ILocationAdd,
	ILocationInCupboard,
	ILocationInCupboardAdd,
	ILocationInCupboardWithNames,
} from "@/types/domain/DomainTypes";
import { EntityDeleteDialog } from "../common/EntityDeleteDialog";
import { EntityEditDialog } from "../common/EntityEditDialog";
import { EntityFormDialog } from "../common/EntityFormDialog";
import { Modal } from "../common/Modal";
import { locationFormConfig } from "../entityConfigs/location";
import {
	LocationInCupboardForm,
	locationInCupboardDeleteSummary,
	locationInCupboardFormConfig,
	locationInCupboardToForm,
	locationInCupboardToUpdate,
	locationsToOptions,
} from "../entityConfigs/locationInCupboard";

interface CupboardLocationsDialogProps {
	open: boolean;
	cupboard: { id: string; codeName: string } | null;
	onClose: () => void;
}

export const CupboardLocationsDialog = ({
	open,
	cupboard,
	onClose,
}: CupboardLocationsDialogProps) => {
	const { t: tLocationInCupboard } = useTranslation("locationincupboard");
	const { t: tCommon } = useTranslation("common");

	const queryClient = useQueryClient();
	const enabled = open && !!cupboard;
	const locationsQuery = useLocations({ enabled });
	const linksQuery = useLocationsInCupboards({ enabled });
	const allLocations = useMemo(
		() => locationsQuery.data ?? [],
		[locationsQuery.data],
	);
	const records = useMemo(() => linksQuery.data ?? [], [linksQuery.data]);
	const listLoading = locationsQuery.isLoading || linksQuery.isLoading;
	const listError = locationsQuery.error || linksQuery.error;

	const crud = useEntityCrud<
		ILocationInCupboardWithNames,
		ILocationInCupboardAdd,
		ILocationInCupboard
	>({
		service: locationInCupboardService,
		// overviewRoot: IAssetViewModel embeds the joined cupboardName/shelfNum/column,
		// so re-placing a location inside a cupboard makes that payload stale.
		invalidateKeys: [qk.locationsInCupboards(), qk.overviewRoot()],
	});

	// Writes two entities, so it stays outside useEntityCrud's create/edit/
	// delete trio.
	const createLocationAndLink = useMutation({
		mutationFn: async ({
			dto,
			cupboardId,
		}: {
			dto: ILocationAdd;
			cupboardId: string;
		}) => {
			const created = await unwrap(locationService.addAsync(dto));
			try {
				return await unwrap(
					locationInCupboardService.addAsync({
						locationId: created.id,
						cupboardId,
					}),
				);
			} catch {
				throw new Error(
					"Location created but failed to add it to the cupboard",
				);
			}
		},
		onSuccess: crud.invalidate,
		// The location exists even when the link step failed, so refresh
		// qk.locations() regardless of outcome.
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: qk.locations() }),
	});

	const [showCreateLocation, setShowCreateLocation] = useState(false);

	const handleCreateLocation = makeConfirmHandler(
		(dto: ILocationAdd) =>
			createLocationAndLink.mutateAsync({
				dto,
				cupboardId: cupboard!.id,
			}),
		() => setShowCreateLocation(false),
	);

	// Locations linked to *any* cupboard are unavailable, not just this one's.
	const usedLocationIds = useMemo(
		() => new Set(records.map((r) => r.locationId)),
		[records],
	);

	const entries = useMemo<ILocationInCupboardWithNames[]>(() => {
		if (!cupboard) return [];
		const locationMap = new Map(
			allLocations.map((l) => [l.id, l.locationName]),
		);
		return records
			.filter((r) => r.cupboardId === cupboard.id)
			.map((r) => ({
				...r,
				codeName: cupboard.codeName,
				locationName: locationMap.get(r.locationId) ?? r.locationId,
			}));
	}, [records, allLocations, cupboard]);

	const availableForCreate = useMemo(
		() => allLocations.filter((l) => !usedLocationIds.has(l.id)),
		[allLocations, usedLocationIds],
	);

	const availableForEdit = useMemo(
		() =>
			allLocations.filter(
				(l) =>
					!usedLocationIds.has(l.id) ||
					l.id === crud.entityToEdit?.locationId,
			),
		[allLocations, usedLocationIds, crud.entityToEdit],
	);

	const createOptions = useMemo(
		() => ({ locations: locationsToOptions(availableForCreate) }),
		[availableForCreate],
	);
	const editOptions = useMemo(
		() => ({ locations: locationsToOptions(availableForEdit) }),
		[availableForEdit],
	);

	if (!cupboard) return null;

	const staticValues = { cupboardCodeName: cupboard.codeName };

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<h2 className="text-xl font-bold mb-1 text-black">
					{tLocationInCupboard("LocationInCupboardTitle")}
				</h2>
				<h4 className="text-lg text-gray-700 mb-4">{cupboard.codeName}</h4>

				<div className="flex justify-end gap-2 mb-4">
					<button
						type="button"
						onClick={() => setShowCreateLocation(true)}
						className="border border-[#ff9800] text-[#f0941d] hover:bg-orange-50 font-medium px-4 py-2 rounded-full text-sm transition-colors duration-150"
					>
						{tLocationInCupboard("NewLocation")}
					</button>
					<button
						type="button"
						onClick={crud.openCreate}
						className="bg-[#ff9800] hover:bg-[#f0941d] text-white font-medium px-4 py-2 rounded-full text-sm transition-colors duration-150"
					>
						{tCommon("CreateNewLink")}
					</button>
				</div>

				<ErrorBanner error={listError} />

				<div className="bg-[#efefef] rounded-2xl p-3 max-h-[50vh] overflow-y-auto">
					{listLoading ? (
						<div className="text-center py-6 text-gray-500">
							{tCommon("Loading")}
						</div>
					) : entries.length === 0 ? (
						<div className="text-center py-6 text-gray-500">
							{tLocationInCupboard("Location")} —
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{entries.map((entry) => (
								<div
									key={entry.id}
									className="bg-white rounded-xl px-4 py-2 flex items-center justify-between gap-3"
								>
									<span className="text-sm text-black truncate">
										{entry.locationName}
									</span>
									<div className="flex gap-2 shrink-0">
										<EditButton
											size="sm"
											label={tCommon("EditLink")}
											onClick={() => crud.openEdit(entry)}
										/>
										<DeleteButton
											size="sm"
											label={tCommon("DeleteLink")}
											onClick={() => crud.openDelete(entry)}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</Modal>

			<EntityFormDialog
				open={crud.showCreate}
				mode="create"
				config={locationInCupboardFormConfig}
				options={createOptions}
				staticValues={staticValues}
				onClose={crud.createDialogProps.onClose}
				onConfirm={(form: LocationInCupboardForm) =>
					crud.handleCreate({
						locationId: form.locationId,
						cupboardId: cupboard.id,
					})
				}
				isLoading={crud.createMutation.isPending}
			/>

			<EntityFormDialog
				open={showCreateLocation}
				mode="create"
				config={locationFormConfig}
				onClose={() => setShowCreateLocation(false)}
				onConfirm={handleCreateLocation}
				isLoading={createLocationAndLink.isPending}
			/>

			<EntityEditDialog
				config={locationInCupboardFormConfig}
				toForm={locationInCupboardToForm}
				toUpdate={locationInCupboardToUpdate}
				options={editOptions}
				staticValues={staticValues}
				{...crud.editDialogProps}
			/>

			<EntityDeleteDialog
				namespace="locationincupboard"
				singularKey="LocationInCupboardSingular"
				summaryFields={locationInCupboardDeleteSummary}
				{...crud.deleteDialogProps}
			/>
		</>
	);
};
