import { IAssetViewModel } from "@/types/domain/IAssetViewModels";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useTags } from "@/hooks/queries/entityQueries";
import { formatDate, formatDateTime } from "@/lib/format";
import EmptyState from "./EmptyState";
import { Button } from "./ui/button";
import AssetListFilterBar, {
	AssetFilterState,
	SortDirection,
	SortField,
	emptyAssetFilter,
} from "./AssetListFilterBar";

interface AssetListProps {
	availableAssets: IAssetViewModel[];
	assetsReservedByUser: IAssetViewModel[];
	onEditAsset: (asset: IAssetViewModel) => Promise<void>;
	onRemoveAsset: (asset: IAssetViewModel) => Promise<void>;
	onReserveAsset: (asset: IAssetViewModel) => Promise<void>;
	onChangeReservationTime: (reservationId: string) => Promise<void>;
	onRemoveReservation: (assetId: string) => Promise<void>;
	onReturnAsset: (assetId: string) => Promise<void>;
	onAuditAsset: (assetId: string) => Promise<boolean>;
	onAssignSlug: (assetId: string) => Promise<boolean>;
	onUploadPhoto: (assetId: string, file: File) => Promise<boolean>;
	loading: Record<string, boolean>;
	mode: string;
	onModeChange: (mode: string) => void;
	searchInput: string;
	onSearchChange: (value: string) => void;
	onSearchSubmit: (e: React.SubmitEvent) => void;
	createLoading: boolean;
	onCreateAsset: () => void;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Green while audited within 30 days, orange within a year, red beyond that. */
const auditButtonClass = (asset: IAssetViewModel) => {
	if (
		!asset.lastAuditAt ||
		Date.now() - new Date(asset.lastAuditAt).getTime() >= 365 * MS_PER_DAY
	) {
		return "bg-danger-soft hover:bg-red-100 text-danger";
	}
	if (Date.now() - new Date(asset.lastAuditAt).getTime() >= 30 * MS_PER_DAY) {
		return "bg-warning-soft hover:bg-orange-100 text-orange-700";
	}
	return "bg-success-soft hover:bg-green-100 text-green-700";
};

const iconBtnClass =
	"p-1.5 rounded-md text-gray-500 hover:text-ink hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors";

const cameraIcon = (className: string) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={1.5}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
		/>
		<circle cx="12" cy="13" r="4" />
	</svg>
);

/** A single inline table/grid action — icon only, labelled via title/aria. */
function IconButton({
	label,
	onClick,
	disabled,
	href,
	target,
	children,
}: {
	label: string;
	onClick?: () => void;
	disabled?: boolean;
	href?: string;
	target?: string;
	children: ReactNode;
}) {
	if (href) {
		return (
			<a
				href={href}
				target={target}
				rel={target ? "noopener noreferrer" : undefined}
				title={label}
				aria-label={label}
				className={iconBtnClass}
			>
				{children}
			</a>
		);
	}
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={label}
			aria-label={label}
			className={iconBtnClass}
		>
			{children}
		</button>
	);
}

/** Icon paths for the inline action set — one <path> string per icon. */
const icon = (d: string) => (
	<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
	</svg>
);

const ICONS = {
	reserve:
		"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM10 14h4M12 12v4",
	return: "M3 7v6h6M21 17a9 9 0 00-15-6.7L3 13",
	clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
	removeReservation:
		"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM10 14l4 4M14 14l-4 4",
	edit: "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 13l-4 1 1-4z",
	remove:
		"M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
	sticker:
		"M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
	assignSlug:
		"M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
};

export default function AssetList({
	availableAssets,
	assetsReservedByUser,
	onEditAsset,
	onRemoveAsset,
	onReserveAsset,
	onChangeReservationTime,
	onRemoveReservation,
	onReturnAsset,
	onAuditAsset,
	onAssignSlug,
	onUploadPhoto,
	loading,
	mode,
	onModeChange,
	searchInput,
	onSearchChange,
	onSearchSubmit,
	createLoading,
	onCreateAsset,
}: AssetListProps) {
	const { t: tCommon } = useTranslation("common");
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");
	const { t: tAssetlistpartial } = useTranslation("_assetlistpartial");

	const { canSeeReservationActions: showActions, canManage } =
		usePermissions();

	const tagsQuery = useTags();
	const tags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);

	// A bumped version re-fetches the photo after an upload replaced it —
	// otherwise the <img> would keep showing the browser-cached old bytes.
	const [photoVersions, setPhotoVersions] = useState<Record<string, number>>(
		{},
	);

	// Which grid cards have their "details" section expanded.
	const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
		{},
	);

	// ------------------------------------------------------------ filtering
	//
	// The bar keeps a draft (what the controls show) and the list applies a
	// separate committed copy, so nothing changes until Apply is pressed.

	const [filterDraft, setFilterDraft] = useState<AssetFilterState>(
		emptyAssetFilter,
	);
	const [appliedFilters, setAppliedFilters] = useState<AssetFilterState>(
		emptyAssetFilter,
	);

	const clearFilters = () => {
		setFilterDraft(emptyAssetFilter());
		setAppliedFilters(emptyAssetFilter());
	};
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	// ONE flat list, like the reference inventory app: the reserved-by-user
	// section is merged in, and the Status column + inline actions carry the
	// reservation information instead of the section split.
	const mergedAssets = useMemo(() => {
		const seen = new Set<string>();
		const merged: IAssetViewModel[] = [];
		for (const asset of [...availableAssets, ...assetsReservedByUser]) {
			if (seen.has(asset.id)) continue;
			seen.add(asset.id);
			merged.push(asset);
		}
		return merged;
	}, [availableAssets, assetsReservedByUser]);

	// Options come from the loaded assets (the names the rows actually show);
	// tag options come from the shared tags query.
	const uniqueNames = (
		assets: IAssetViewModel[],
		pick: (a: IAssetViewModel) => string,
	) => Array.from(new Set(assets.map(pick))).sort();
	const categoryOptions = useMemo(
		() => uniqueNames(mergedAssets, (a) => a.categoryName),
		[mergedAssets],
	);
	const ownerOptions = useMemo(
		() => uniqueNames(mergedAssets, (a) => a.ownerName),
		[mergedAssets],
	);
	const roomOptions = useMemo(
		() => uniqueNames(mergedAssets, (a) => a.roomName),
		[mergedAssets],
	);

	// Client-side filtering over the merged list. Tags are matched by name:
	// the VM carries names and the selected ids are translated through the
	// tags list.
	const filteredAssets = useMemo(() => {
		const { category, owner, room, visibility, tagIds } = appliedFilters;
		if (
			!category &&
			!owner &&
			!room &&
			!visibility &&
			tagIds.length === 0
		) {
			return mergedAssets;
		}
		const selectedTagNames = new Set(
			tags.filter((tag) => tagIds.includes(tag.id)).map((tag) => tag.tagName),
		);
		return mergedAssets.filter(
			(asset) =>
				(!category || asset.categoryName === category) &&
				(!owner || asset.ownerName === owner) &&
				(!room || asset.roomName === room) &&
				(!visibility || asset.visibility === visibility) &&
				(tagIds.length === 0 ||
					asset.tags.some((tagName) => selectedTagNames.has(tagName))),
		);
	}, [mergedAssets, appliedFilters, tags]);

	const sortedAssets = useMemo(() => {
		const dir = sortDirection === "asc" ? 1 : -1;
		return [...filteredAssets].sort((a, b) => {
			switch (sortField) {
				case "added":
					return (
						dir *
						(new Date(a.addedAt).getTime() -
							new Date(b.addedAt).getTime())
					);
				case "audited":
					return (
						dir *
						((a.lastAuditAt ? new Date(a.lastAuditAt).getTime() : 0) -
							(b.lastAuditAt
								? new Date(b.lastAuditAt).getTime()
								: 0))
					);
				default:
					return dir * a.assetName.localeCompare(b.assetName);
			}
		});
	}, [filteredAssets, sortField, sortDirection]);

	// ------------------------------------------------------------ helpers

	const isReservationExpired = (asset: IAssetViewModel) =>
		asset.reservationTo != null &&
		new Date(asset.reservationTo) < new Date();

	// Only the caller's own reservations get the return/change-time/remove
	// actions — identified by their reservation ids, merged-list style.
	const myReservationIds = useMemo(
		() =>
			new Set(
				assetsReservedByUser
					.map((asset) => asset.reservationId)
					.filter((id): id is string => !!id),
			),
		[assetsReservedByUser],
	);
	const isReservedByMe = (asset: IAssetViewModel) =>
		!!asset.reservationId && myReservationIds.has(asset.reservationId);

	const handleCardPhotoChange = async (
		asset: IAssetViewModel,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		// Clearing first lets picking the same file again re-fire onChange.
		event.target.value = "";
		if (!file) return;
		if (await onUploadPhoto(asset.id, file)) {
			setPhotoVersions((prev) => ({
				...prev,
				[asset.id]: (prev[asset.id] ?? 0) + 1,
			}));
		}
	};

	const photoVersion = (asset: IAssetViewModel) =>
		photoVersions[asset.id] ?? 0;

	// ------------------------------------------------------------ cells

	const renderTagChips = (asset: IAssetViewModel) =>
		asset.tags.length > 0 && (
			<div className="flex flex-wrap gap-1 mt-0.5">
				{asset.tags.map((tagName) => (
					<span
						key={tagName}
						className="bg-gray-100 text-gray-600 text-xs px-1.5 rounded"
					>
						{tagName}
					</span>
				))}
			</div>
		);

	/** Photo cell: a 48-ish px thumbnail, or a camera icon when there is none. */
	const renderPhotoCell = (asset: IAssetViewModel) => (
		<div className="w-12 h-9 flex items-center justify-center">
			{asset.hasPhoto ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={`/api/v1/assets/${asset.id}/photo?v=${photoVersion(asset)}`}
					alt={asset.assetName}
					className="w-12 h-9 object-cover rounded"
				/>
			) : (
				cameraIcon("w-4 h-4 text-gray-300")
			)}
		</div>
	);

	/** Name cell: name, serial/comment as a muted line, tags as tiny chips. */
	const renderNameCell = (asset: IAssetViewModel) => (
		<div>
			<div className="font-medium text-gray-800 break-words">
				{asset.assetName}
			</div>
			{(asset.serialNumber || asset.comment) && (
				<div className="text-xs text-gray-500 truncate max-w-[16rem]">
					{[asset.serialNumber, asset.comment]
						.filter(Boolean)
						.join(" · ")}
				</div>
			)}
			{renderTagChips(asset)}
		</div>
	);

	const renderLocationCell = (asset: IAssetViewModel) => (
		<div className="text-gray-700">
			<div className="whitespace-nowrap">
				{asset.roomName} {asset.cupboardName}
			</div>
			<div className="text-xs text-gray-400">
				{asset.shelfNum} / {asset.column}
			</div>
		</div>
	);

	/** Reservation status: holder + until, expired ones tinted red. */
	const renderStatusCell = (asset: IAssetViewModel) => {
		if (!asset.reserved) {
			return <span className="text-gray-300">—</span>;
		}
		const expired = isReservationExpired(asset);
		return (
			<div className="text-xs whitespace-nowrap">
				<span
					className={
						expired
							? "text-red-600 font-medium"
							: "text-gray-700"
					}
					title={tAssetlistpartial("NotYetReturned")}
				>
					{asset.closestReservationBy}
				</span>
				{asset.reservationTo && (
					<span className={expired ? "text-red-500" : "text-gray-500"}>
						{" "}
						· {tAssetlistpartial("Until")}{" "}
						{formatDateTime(asset.reservationTo)}
					</span>
				)}
			</div>
		);
	};

	/** The colored one-click audit button — the date/is audited state itself. */
	const renderAuditButton = (asset: IAssetViewModel, isDisabled: boolean) => (
		<button
			type="button"
			onClick={() => onAuditAsset(asset.id)}
			disabled={isDisabled}
			title={`${tAssetlistpartial("Audit")}${asset.lastAuditBy ? ` · ${asset.lastAuditBy}` : ""}`}
			aria-label={tAssetlistpartial("Audit")}
			className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none ${auditButtonClass(asset)}`}
		>
			{asset.lastAuditAt
				? formatDate(asset.lastAuditAt)
				: tAssetlistpartial("AuditNever")}
		</button>
	);

	const renderUploadPhotoIcon = (
		asset: IAssetViewModel,
		isDisabled: boolean,
	) => (
		<label
			title={tAssetlistpartial("UploadPhoto")}
			aria-label={tAssetlistpartial("UploadPhoto")}
			className={`${iconBtnClass} ${isDisabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
		>
			{cameraIcon("w-4 h-4")}
			<input
				type="file"
				accept="image/jpeg,image/png"
				className="hidden"
				disabled={isDisabled}
				onChange={(e) => handleCardPhotoChange(asset, e)}
			/>
		</label>
	);

	/**
	 * The per-asset inline actions — one row of icon buttons, not stacked
	 * pills. Same permission gating as before: canSeeReservationActions opens
	 * the reserve/edit flows, canManage adds the sticker/slug/photo tools.
	 */
	const renderActions = (asset: IAssetViewModel) => {
		if (!showActions) return null;
		const isDisabled = loading[asset.id];
		const mine = isReservedByMe(asset);
		// An expired reservation can only be returned — its time can no longer
		// be changed and there is nothing left to cancel.
		const expired = isReservationExpired(asset);

		return (
			<div className="flex items-center gap-0.5 justify-end">
				{!asset.reserved && !mine && (
					<IconButton
						label={tAssetlistpartial("Reserve")}
						onClick={() => onReserveAsset(asset)}
						disabled={isDisabled}
					>
						{icon(ICONS.reserve)}
					</IconButton>
				)}
				{mine && (
					<IconButton
						label={tAssetlistpartial("Returned")}
						onClick={() => onReturnAsset(asset.id)}
						disabled={isDisabled}
					>
						{icon(ICONS.return)}
					</IconButton>
				)}
				{mine && !expired && (
					<>
						<IconButton
							label={tAssetlistpartial("ChangeReservationTime")}
							onClick={() =>
								onChangeReservationTime(asset.reservationId!)
							}
							disabled={isDisabled || !asset.reservationId}
						>
							{icon(ICONS.clock)}
						</IconButton>
						<IconButton
							label={tAssetlistpartial("RemoveReservation")}
							onClick={() => onRemoveReservation(asset.id)}
							disabled={isDisabled}
						>
							{icon(ICONS.removeReservation)}
						</IconButton>
					</>
				)}
				<IconButton
					label={tCommon("EditLink")}
					onClick={() => onEditAsset(asset)}
					disabled={isDisabled}
				>
					{icon(ICONS.edit)}
				</IconButton>
				<IconButton
					label={tAssetlistpartial("Remove")}
					onClick={() => onRemoveAsset(asset)}
					disabled={isDisabled}
				>
					{icon(ICONS.remove)}
				</IconButton>
				{canManage && asset.slug && (
					<IconButton
						label={tAssetlistpartial("Sticker")}
						href={`/sticker/${asset.slug}`}
						target="_blank"
					>
						{icon(ICONS.sticker)}
					</IconButton>
				)}
				{canManage && !asset.slug && (
					<IconButton
						label={tAssetlistpartial("AssignSlug")}
						onClick={() => onAssignSlug(asset.id)}
						disabled={isDisabled}
					>
						{icon(ICONS.assignSlug)}
					</IconButton>
				)}
				{canManage &&
					renderUploadPhotoIcon(asset, isDisabled)}
			</div>
		);
	};

	// ------------------------------------------------------------- table view

	const tableHeaders: string[] = [
		"", // photo indicator column
		tAssetlistpartial("Sticker"),
		tCommon("Visibility"),
		tAssetViewModel("Category"),
		tAssetViewModel("AssetName"),
		tAssetViewModel("Location"),
		tAssetViewModel("Owner"),
		tAssetlistpartial("Status"),
		tAssetlistpartial("Audited"),
	];

	const renderTable = () => (
		<div className="bg-white border border-gray-100 rounded-lg shadow-card overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-sm min-w-[1000px]">
					<thead>
						<tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
							{tableHeaders.map((header, index) => (
								<th
									key={`${header}-${index}`}
									className="px-2 py-2 text-left font-medium whitespace-nowrap"
								>
									{index === 0
										? cameraIcon("w-4 h-4 text-gray-300")
										: header}
								</th>
							))}
							{showActions && (
								<th className="px-2 py-2 text-right font-medium whitespace-nowrap">
									{tAssetlistpartial("Actions")}
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{sortedAssets.map((asset) => {
							const expired =
								asset.reserved && isReservationExpired(asset);
							return (
								<tr
									key={asset.id}
									className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
										expired ? "bg-red-50" : ""
									}`}
								>
									<td className="px-2 py-1.5">
										{renderPhotoCell(asset)}
									</td>
									<td className="px-2 py-1.5">
										{asset.slug ? (
											<a
												href={`/sticker/${asset.slug}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-link hover:underline whitespace-nowrap"
											>
												{asset.slug}
											</a>
										) : (
											<span className="text-gray-300">
												—
											</span>
										)}
									</td>
									<td className="px-2 py-1.5">
										<span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 whitespace-nowrap">
											{tCommon(asset.visibility)}
										</span>
									</td>
									<td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
										{asset.categoryName}
									</td>
									<td className="px-2 py-1.5">
										{renderNameCell(asset)}
									</td>
									<td className="px-2 py-1.5">
										{renderLocationCell(asset)}
									</td>
									<td className="px-2 py-1.5 text-gray-600">
										{asset.ownerName}
									</td>
									<td className="px-2 py-1.5">
										{renderStatusCell(asset)}
									</td>
									<td className="px-2 py-1.5">
										{renderAuditButton(
											asset,
											!!loading[asset.id],
										)}
									</td>
									{showActions && (
										<td className="px-2 py-1.5">
											{renderActions(asset)}
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{sortedAssets.length === 0 && renderEmpty()}
		</div>
	);

	// -------------------------------------------------------------- grid view

	const toggleCardExpanded = (assetId: string) =>
		setExpandedCards((prev) => ({ ...prev, [assetId]: !prev[assetId] }));

	const renderGrid = () => (
		<ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{sortedAssets.map((asset) => {
				const expired = asset.reserved && isReservationExpired(asset);
				const expanded = !!expandedCards[asset.id];
				return (
					<li
						key={asset.id}
						className={`bg-white border rounded-lg shadow-card overflow-hidden ${
							expired
								? "border-red-200 bg-red-50"
								: "border-gray-100"
						}`}
					>
						{/* Image-first like the reference grid card */}
						{asset.hasPhoto ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={`/api/v1/assets/${asset.id}/photo?v=${photoVersion(asset)}`}
								alt={asset.assetName}
								className="w-full aspect-[4/3] object-cover bg-field"
							/>
						) : (
							<div className="w-full aspect-[4/3] bg-field flex items-center justify-center">
								{cameraIcon("w-10 h-10 text-gray-300")}
							</div>
						)}
						<div className="p-3">
							<h3 className="line-clamp-2 font-medium text-gray-800">
								{asset.assetName}
							</h3>
							<p className="text-xs text-gray-500 mt-1">
								{tAssetViewModel("Owner")}: {asset.ownerName}
							</p>
							<p className="text-xs text-gray-500">
								{tAssetlistpartial("CurrentUser")}:{" "}
								{asset.reserved
									? asset.closestReservationBy
									: "—"}
							</p>
							<div className="mt-2 flex items-center justify-between">
								<button
									type="button"
									onClick={() =>
										toggleCardExpanded(asset.id)
									}
									className="text-sm text-link hover:underline"
								>
									{tCommon("DetailsLink")}
								</button>
								{renderAuditButton(
									asset,
									!!loading[asset.id],
								)}
							</div>
							{expanded && (
								<div className="mt-2 pt-2 border-t border-gray-100">
									<div className="text-xs text-gray-500 space-y-1">
										<div>
											{tAssetViewModel("Category")}:{" "}
											{asset.categoryName}
										</div>
										{asset.serialNumber && (
											<div>
												{tAssetViewModel("SerialNumber")}
												: {asset.serialNumber}
											</div>
										)}
										<div>
											{tAssetViewModel("Location")}:{" "}
											{asset.roomName}{" "}
											{asset.cupboardName} ·{" "}
											{asset.shelfNum}/{asset.column}
										</div>
										{asset.reserved && (
											<div>
												{renderStatusCell(asset)}
											</div>
										)}
										{asset.tags.length > 0 &&
											renderTagChips(asset)}
										{asset.comment && (
											<div className="text-gray-600">
												{asset.comment}
											</div>
										)}
									</div>
									<div className="mt-2">
										{renderActions(asset)}
									</div>
								</div>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);

	/**
	 * The shared empty state: if the search/filters are the reason the list is
	 * empty, hint at it and offer Reset; otherwise offer the create CTA.
	 */
	const renderEmpty = () => {
		const filtersActive =
			!!appliedFilters.category ||
			!!appliedFilters.owner ||
			!!appliedFilters.room ||
			!!appliedFilters.visibility ||
			appliedFilters.tagIds.length > 0 ||
			searchInput.trim() !== "";
		return (
			<EmptyState
				message={tAssetlistpartial("NoAssetsToDisplay")}
				hint={filtersActive ? tAssetlistpartial("NoAssetsHint") : undefined}
				action={
					filtersActive ? (
						<Button variant="outline" onClick={clearFilters}>
							{tCommon("Reset")}
						</Button>
					) : showActions ? (
						<Button onClick={onCreateAsset} disabled={createLoading}>
							{tAssetViewModel("CreateNewAsset")}
						</Button>
					) : undefined
				}
			/>
		);
	};

	// ----------------------------------------------------------------- page

	return (
		<div className="text-left">
			<AssetListFilterBar
				searchInput={searchInput}
				onSearchChange={onSearchChange}
				onSearchSubmit={onSearchSubmit}
				draft={filterDraft}
				onDraftChange={setFilterDraft}
				onApply={() => setAppliedFilters(filterDraft)}
				onReset={clearFilters}
				categoryOptions={categoryOptions}
				ownerOptions={ownerOptions}
				roomOptions={roomOptions}
				tags={tags}
				sortField={sortField}
				onSortFieldChange={setSortField}
				sortDirection={sortDirection}
				onSortDirectionChange={setSortDirection}
				mode={mode}
				onModeChange={onModeChange}
				showActions={showActions}
				createLoading={createLoading}
				onCreateAsset={onCreateAsset}
			/>
			{mode === "cards" ? (
				<>
					{renderGrid()}
					{sortedAssets.length === 0 && renderEmpty()}
				</>
			) : (
				renderTable()
			)}
		</div>
	);
}
