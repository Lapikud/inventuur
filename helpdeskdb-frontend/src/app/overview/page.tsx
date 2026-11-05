"use client";

import { useTranslation } from "react-i18next";
import { AccountContext } from "@/context/AccountContext";
import { assetService, overviewService } from "@/services";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOverview } from "@/hooks/queries/overviewQueries";
import {
	useAsset,
	useAssetReservation,
	useCategories,
	useCategoryAssetByAsset,
	useLocations,
	useOwnerAssetByAsset,
	useOwners,
} from "@/hooks/queries/entityQueries";
import { assetWriteKeys, qk } from "@/lib/queryKeys";
import { getErrorMessage, unwrap } from "@/services/errors";
import {
	IAssetViewModel,
	IAssetViewModelCreate,
	IAssetViewModelRemove,
	IAssetViewModelUpdate,
} from "@/types/domain/IAssetViewModels";
import {
	IAssetReservationWithNames,
	IChangeReservationTimePayload,
	IReserveAssetPayload,
} from "@/types/domain/DomainTypes";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AssetList from "@/components/AssetList";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { useDialogSelection } from "@/hooks/useDialogSelection";
import { makeConfirmHandler } from "@/hooks/useEntityCrud";
import { EditAssetDialog } from "@/components/dialogs/overviewDialogs/EditAssetDialog";
import { RemoveAssetDialog } from "@/components/dialogs/overviewDialogs/RemoveAssetDialog";
import { Skeleton } from "@/components/Skeleton";
import { CreateAssetDialog } from "@/components/dialogs/overviewDialogs/CreateAssetDialog";
import { ReserveAssetDialog } from "@/components/dialogs/overviewDialogs/ReserveAssetDialog";
import { ChangeReservationTimeDialog } from "@/components/dialogs/overviewDialogs/ChangeReservationTimeDialog";
import { RemoveReservationDialog } from "@/components/dialogs/overviewDialogs/RemoveReservationDialog";

// Stable identity so the selection hooks' callbacks don't churn every render.
const assetId = (asset: IAssetViewModel) => asset.id;

// Re-clicking the same row is the retry gesture after a failed load: the query
// keys don't change, so an errored query would otherwise never refetch and the
// row would stay stuck. A different row changes the keys and fetches on its own.
const refetchErrored = (
	queries: { isError: boolean; refetch: () => unknown }[],
) => {
	for (const query of queries) {
		if (query.isError) query.refetch();
	}
};

// `isLoading` (in flight), not `!isSuccess`: a query that errored is also not
// successful, and keying off that would pin the spinner on forever. A disabled
// query reports `isLoading: false`, so an asset with no reservation to load
// never spins either. The `isError && isFetching` term covers the retry after a
// failed load (see `refetchErrored`): that refetch keeps `status: "error"`, so
// `isLoading` alone would leave the row spinner off while it is in flight.
const dialogDataLoading = (query: {
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
}) => query.isLoading || (query.isError && query.isFetching);

export default function Overview() {
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");
	const { t: tCommon } = useTranslation("common");
	const { accountInfo } = useContext(AccountContext);
	const router = useRouter();
	const searchParams = useSearchParams();

	const [selectedMode, setSelectedMode] = useState<string>("lines");

	// The URL is the source of truth for the search term; `searchInput` is just
	// the uncontrolled field's draft until it is submitted.
	const searchTerm = searchParams.get("searchTerm") || "";
	const [searchInput, setSearchInput] = useState(searchTerm);

	useEffect(() => {
		setSearchInput(searchTerm);
	}, [searchTerm]);

	const overview = useOverview(searchTerm);
	const availableAssets = overview.data?.availableAssets ?? [];
	const assetsReservedByUser = overview.data?.assetsReservedByUser ?? [];

	// Reference data for the create/edit dropdowns. Shared with /categories,
	// /locations and /owners through the cache, and held for 5 minutes, so the
	// dialogs open with the lists already in hand.
	const categoriesQuery = useCategories();
	const locationsQuery = useLocations();
	const ownersQuery = useOwners();
	const categories = categoriesQuery.data ?? [];
	const locations = locationsQuery.data ?? [];
	const owners = ownersQuery.data ?? [];

	// --------------------------------------------------------------- dialogs
	//
	// Each dialog is driven by the entity it acts on rather than a separate
	// `show…` flag: selecting a row enables that dialog's queries, and the
	// dialog opens once they have resolved. That keeps the row spinner and the
	// dialog's data in lockstep without an imperative fetch-then-open step.

	const [showCreateModal, setShowCreateModal] = useState(false);

	// Selecting a row also writes the dialog's id to the URL. Those params are
	// write-only breadcrumbs — nothing reads them back, so a refresh lands on
	// the page with no dialog open.
	const {
		selected: assetToUpdate,
		select: selectAssetToUpdate,
		clear: clearAssetToUpdate,
	} = useDialogSelection<IAssetViewModel>({
		queryParamKey: "editId",
		getId: assetId,
	});
	const {
		selected: assetToRemove,
		select: selectAssetToRemove,
		clear: clearAssetToRemove,
	} = useDialogSelection<IAssetViewModel>({
		queryParamKey: "removeId",
		getId: assetId,
	});
	const {
		selected: assetToReserve,
		select: selectAssetToReserve,
		clear: clearAssetToReserve,
	} = useDialogSelection<IAssetViewModel>({
		queryParamKey: "reserveId",
		getId: assetId,
	});
	const {
		selected: reservationIdToChange,
		select: selectReservationToChange,
		clear: clearReservationToChange,
	} = useDialogSelection<string>({ queryParamKey: "changeReservationId" });
	const {
		selected: assetIdToFreeUp,
		select: selectAssetToFreeUp,
		clear: clearAssetToFreeUp,
	} = useDialogSelection<string>();

	const editAssetId = assetToUpdate?.id ?? null;
	const editAssetQuery = useAsset(editAssetId);
	const editCategoryAssetQuery = useCategoryAssetByAsset(editAssetId);
	const editOwnerAssetQuery = useOwnerAssetByAsset(editAssetId);
	const editQueries = [
		editAssetQuery,
		editCategoryAssetQuery,
		editOwnerAssetQuery,
	];

	// `isSuccess`, not `!isLoading`: a failed query is also "not loading", and
	// opening the dialog then would hand it undefined data. Note the two
	// mapping queries resolve to `null` when an asset has no mapping yet —
	// still a success.
	const editDataReady =
		!!editAssetId && editQueries.every((query) => query.isSuccess);

	const changeReservationQuery = useAssetReservation(reservationIdToChange);
	const assetToChangeReservation =
		assetsReservedByUser.find(
			(asset) => asset.reservationId === reservationIdToChange,
		) ?? null;

	const assetToFreeUp =
		assetsReservedByUser.find((asset) => asset.id === assetIdToFreeUp) ??
		null;
	const freeUpReservationQuery = useAssetReservation(
		assetToFreeUp?.reservationId ?? null,
	);

	// RemoveReservationDialog renders the asset and user names alongside the
	// reservation, which the reservation endpoint doesn't return — join them
	// from the row and the current identity.
	const reservationToFreeUp: IAssetReservationWithNames | null = useMemo(() => {
		if (!freeUpReservationQuery.data || !assetToFreeUp) return null;
		return {
			...freeUpReservationQuery.data,
			assetName: assetToFreeUp.assetName,
			userName: accountInfo?.name ?? "",
		};
	}, [freeUpReservationQuery.data, assetToFreeUp, accountInfo?.name]);

	// ------------------------------------------------------------- mutations

	const queryClient = useQueryClient();

	// Creating or editing an asset writes its category/location/owner mappings
	// too, so those lists have to go stale alongside the asset lists. Shared with
	// /dbassets via assetWriteKeys so the two can't drift apart again.
	const invalidateAssetData = () => {
		for (const queryKey of assetWriteKeys()) {
			queryClient.invalidateQueries({ queryKey });
		}
	};

	const invalidateReservationData = () => {
		for (const queryKey of [qk.overviewRoot(), qk.assetReservations()]) {
			queryClient.invalidateQueries({ queryKey });
		}
	};

	const createAsset = useMutation({
		mutationFn: (data: IAssetViewModelCreate) =>
			unwrap(overviewService.createAsset(data)),
		onSuccess: invalidateAssetData,
	});

	// Each of these DTOs already carries the id its endpoint is keyed by, so the
	// mutations take the DTO alone — which is also what makes `variables` a
	// uniform place to read the in-flight asset id from, below.
	const updateAsset = useMutation({
		mutationFn: (data: IAssetViewModelUpdate) =>
			unwrap(overviewService.updateAsset(data.assetId, data)),
		onSuccess: invalidateAssetData,
	});

	const removeAsset = useMutation({
		mutationFn: (data: IAssetViewModelRemove) =>
			unwrap(overviewService.removeAsset(data.assetId, data)),
		// Removing an asset also cancels its reservations.
		onSuccess: () => {
			invalidateAssetData();
			invalidateReservationData();
		},
	});

	const reserveAsset = useMutation({
		mutationFn: (data: IReserveAssetPayload) =>
			unwrap(overviewService.reserveAsset(data.assetId, data)),
		onSuccess: invalidateReservationData,
	});

	const returnAsset = useMutation({
		mutationFn: (assetId: string) =>
			unwrap(overviewService.returnAsset(assetId)),
		onSuccess: invalidateReservationData,
	});

	const removeReservation = useMutation({
		mutationFn: (assetId: string) =>
			unwrap(overviewService.removeReservation(assetId)),
		onSuccess: invalidateReservationData,
	});

	const changeReservationTime = useMutation({
		mutationFn: (data: IChangeReservationTimePayload) =>
			unwrap(
				overviewService.changeReservationTime(
					data.assetReservationId,
					data,
				),
			),
		// The list key no longer prefix-matches per-id entries, so the edited
		// reservation's own entry must be invalidated explicitly — otherwise
		// reopening the dialog within staleTime would show the pre-edit times.
		onSuccess: (_data, data) => {
			invalidateReservationData();
			queryClient.invalidateQueries({
				queryKey: qk.assetReservation(data.assetReservationId),
			});
		},
	});

	// The inventory-app card actions. Each writes a field the overview view
	// model embeds, so the overview list is what has to go stale.
	const auditAsset = useMutation({
		mutationFn: (assetId: string) =>
			unwrap(assetService.auditAsync(assetId)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: qk.overviewRoot() });
		},
	});

	// A null slug asks the backend to auto-generate a random one.
	const assignSlug = useMutation({
		mutationFn: (assetId: string) =>
			unwrap(assetService.updateSlugAsync(assetId, null)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: qk.overviewRoot() });
		},
	});

	const uploadPhoto = useMutation({
		mutationFn: (data: { assetId: string; file: File }) =>
			unwrap(assetService.uploadPhotoAsync(data.assetId, data.file)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: qk.overviewRoot() });
		},
	});

	// ---------------------------------------------------------------- search

	const submitSearch = useCallback(
		(value: string) => {
			const params = new URLSearchParams();
			if (value) params.set("searchTerm", value);
			router.push(`${window.location.pathname}?${params.toString()}`);
		},
		[router],
	);

	const handleSearch = (e: React.SubmitEvent) => {
		e.preventDefault();
		submitSearch(searchInput);
	};

	// Mirrors the dialogs' `open` props rather than the selection state: a
	// selection whose data failed to load never opens a dialog, and must not
	// leave the scanner disabled with no way to re-enable it.
	const anyDialogOpen =
		showCreateModal ||
		editDataReady ||
		!!assetToRemove ||
		!!assetToReserve ||
		(changeReservationQuery.isSuccess && !!assetToChangeReservation) ||
		!!reservationToFreeUp;

	useBarcodeScanner({
		onScan: useCallback(
			(code: string) => {
				setSearchInput(code);
				submitSearch(code);
			},
			[submitSearch],
		),
		enabled: !anyDialogOpen,
	});

	// A refetch can drop the selected reservation's row (returned or removed
	// from another tab, say). The dialog can't render without the row, so the
	// selection must be cleared — left set, it would keep `anyDialogOpen` true
	// and pin the barcode scanner off with nothing visible to close.
	useEffect(() => {
		if (
			reservationIdToChange &&
			overview.isSuccess &&
			!assetToChangeReservation
		) {
			clearReservationToChange();
		}
	}, [
		reservationIdToChange,
		overview.isSuccess,
		assetToChangeReservation,
		clearReservationToChange,
	]);

	// -------------------------------------------------------------- handlers
	//
	// Every dialog speaks the same ConfirmResult contract: the mutation runs,
	// success clears the selection (which closes the dialog), and a failure
	// resolves to `{ error }` for the dialog to render inline — so a rejected
	// save keeps the dialog open with the user's input still in it.

	const handleCreate = makeConfirmHandler(createAsset.mutateAsync, () =>
		setShowCreateModal(false),
	);

	const handleEdit = makeConfirmHandler(
		updateAsset.mutateAsync,
		clearAssetToUpdate,
	);

	const handleRemove = makeConfirmHandler(
		removeAsset.mutateAsync,
		clearAssetToRemove,
	);

	const handleReserve = makeConfirmHandler(
		reserveAsset.mutateAsync,
		clearAssetToReserve,
	);

	const handleRemoveReservation = makeConfirmHandler(
		removeReservation.mutateAsync,
		clearAssetToFreeUp,
	);

	const handleChangeReservationTime = makeConfirmHandler(
		changeReservationTime.mutateAsync,
		clearReservationToChange,
	);

	// The odd one out: a row action with no dialog to host the error.
	const handleReturnAsset = async (id: string) => {
		try {
			await returnAsset.mutateAsync(id);
		} catch (error) {
			alert(getErrorMessage(error));
		}
	};

	// More row actions with no dialog to host the error. Like handleReturnAsset
	// there is nothing inline to render it into, but these report through a
	// toast instead of alert() and resolve to true/false so AssetList knows
	// whether the photo cache-buster version should be bumped.
	const handleAuditAsset = async (assetId: string) => {
		try {
			await auditAsset.mutateAsync(assetId);
			return true;
		} catch (error) {
			toast.error(getErrorMessage(error));
			return false;
		}
	};

	const handleAssignSlug = async (assetId: string) => {
		try {
			await assignSlug.mutateAsync(assetId);
			return true;
		} catch (error) {
			toast.error(getErrorMessage(error));
			return false;
		}
	};

	const handleUploadPhoto = async (assetId: string, file: File) => {
		try {
			await uploadPhoto.mutateAsync({ assetId, file });
			return true;
		} catch (error) {
			toast.error(getErrorMessage(error));
			return false;
		}
	};

	// --------------------------------------------------------- render state

	// AssetList disables a row's actions while anything concerning that asset
	// is in flight — either its dialog data loading, or its mutation running.
	const loading: Record<string, boolean> = {};
	const markLoading = (id: string | null | undefined) => {
		if (id) loading[id] = true;
	};

	const editDataLoading = editQueries.some(dialogDataLoading);

	if (editDataLoading) markLoading(editAssetId);
	if (dialogDataLoading(changeReservationQuery)) {
		markLoading(assetToChangeReservation?.id);
	}
	if (dialogDataLoading(freeUpReservationQuery)) markLoading(assetIdToFreeUp);
	if (updateAsset.isPending) markLoading(updateAsset.variables?.assetId);
	if (removeAsset.isPending) markLoading(removeAsset.variables?.assetId);
	if (reserveAsset.isPending) markLoading(reserveAsset.variables?.assetId);
	if (returnAsset.isPending) markLoading(returnAsset.variables);
	if (removeReservation.isPending) markLoading(removeReservation.variables);
	if (changeReservationTime.isPending) {
		markLoading(changeReservationTime.variables?.assetId);
	}
	if (auditAsset.isPending) markLoading(auditAsset.variables);
	if (assignSlug.isPending) markLoading(assignSlug.variables);
	if (uploadPhoto.isPending) markLoading(uploadPhoto.variables?.assetId);

	const loadFailed =
		overview.isError ||
		// Without these the create/edit dropdowns would just render empty.
		categoriesQuery.isError ||
		locationsQuery.isError ||
		ownersQuery.isError ||
		editQueries.some((query) => query.isError) ||
		changeReservationQuery.isError ||
		freeUpReservationQuery.isError;

	// True only before the very first result: `keepPreviousData` keeps the old
	// list on screen while a new search term loads.
	if (overview.isLoading) {
		// The first fetch has no cached list to keep on screen, so the page
		// renders its own shape in skeleton form: heading, filter bar, rows.
		return (
			<div className="min-h-screen bg-surface -mx-3 sm:-mx-4 px-6 sm:px-14 py-8 text-left">
				<Skeleton className="h-9 w-72 mb-6" />
				<Skeleton className="h-14 w-full mb-4 rounded-lg" />
				<div className="bg-white border border-gray-100 rounded-lg shadow-card divide-y divide-gray-100">
					{Array.from({ length: 9 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4 px-3 py-3">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 flex-1" />
							<Skeleton className="h-5 w-24 max-sm:hidden" />
							<Skeleton className="h-5 w-24 max-sm:hidden" />
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-5 w-36" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface -mx-3 sm:-mx-4 px-6 sm:px-14 py-8 text-left">
			<h1 className="text-3xl font-bold text-ink mb-6">
				{tAssetViewModel("AssetsOverview")}
			</h1>
			{loadFailed && (
				<div className="mb-4 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-3">
					{tCommon("LoadFailed")}
				</div>
			)}
			<AssetList
				availableAssets={availableAssets}
				assetsReservedByUser={assetsReservedByUser}
				onEditAsset={async (asset: IAssetViewModel) => {
					if (asset.id === editAssetId) refetchErrored(editQueries);
					selectAssetToUpdate(asset);
				}}
				onRemoveAsset={async (asset: IAssetViewModel) => {
					selectAssetToRemove(asset);
				}}
				onReserveAsset={async (asset: IAssetViewModel) => {
					selectAssetToReserve(asset);
				}}
				loading={loading}
				mode={selectedMode}
				onModeChange={(m) => setSelectedMode(m)}
				searchInput={searchInput}
				onSearchChange={(v) => setSearchInput(v)}
				onSearchSubmit={handleSearch}
				createLoading={
					categoriesQuery.isLoading ||
					locationsQuery.isLoading ||
					ownersQuery.isLoading
				}
				onCreateAsset={async () => setShowCreateModal(true)}
				onChangeReservationTime={async (reservationId: string) => {
					if (reservationId === reservationIdToChange) {
						refetchErrored([changeReservationQuery]);
					}
					selectReservationToChange(reservationId);
				}}
				onReturnAsset={handleReturnAsset}
				onAuditAsset={handleAuditAsset}
				onAssignSlug={handleAssignSlug}
				onUploadPhoto={handleUploadPhoto}
				onRemoveReservation={async (id: string) => {
					if (id === assetIdToFreeUp) {
						refetchErrored([freeUpReservationQuery]);
					}
					selectAssetToFreeUp(id);
				}}
			/>
			<CreateAssetDialog
				open={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSubmit={handleCreate}
				categories={categories}
				locations={locations}
				owners={owners}
				isLoading={createAsset.isPending}
			/>
			<EditAssetDialog
				open={editDataReady}
				asset={assetToUpdate}
				comment={editAssetQuery.data?.comment ?? ""}
				categoryAssets={editCategoryAssetQuery.data ?? null}
				ownerAssets={editOwnerAssetQuery.data ?? null}
				locations={locations}
				categories={categories}
				owners={owners}
				onClose={clearAssetToUpdate}
				onConfirm={handleEdit}
				isLoading={updateAsset.isPending}
			/>
			<RemoveAssetDialog
				open={!!assetToRemove}
				asset={assetToRemove}
				onClose={clearAssetToRemove}
				onConfirm={handleRemove}
				isLoading={removeAsset.isPending}
			/>
			<ReserveAssetDialog
				open={!!assetToReserve}
				asset={assetToReserve}
				onClose={clearAssetToReserve}
				onConfirm={handleReserve}
				isLoading={reserveAsset.isPending}
			/>
			<ChangeReservationTimeDialog
				open={
					changeReservationQuery.isSuccess &&
					!!assetToChangeReservation
				}
				assetReservationId={reservationIdToChange}
				asset={assetToChangeReservation}
				initialFrom={
					changeReservationQuery.data
						? new Date(changeReservationQuery.data.reservationFrom)
						: null
				}
				initialTo={
					changeReservationQuery.data
						? new Date(changeReservationQuery.data.reservationTo)
						: null
				}
				onClose={clearReservationToChange}
				onConfirm={handleChangeReservationTime}
				isLoading={changeReservationTime.isPending}
			/>
			<RemoveReservationDialog
				open={!!reservationToFreeUp}
				reservation={reservationToFreeUp}
				onClose={clearAssetToFreeUp}
				onConfirm={handleRemoveReservation}
				isLoading={removeReservation.isPending}
			/>
		</div>
	);
}
