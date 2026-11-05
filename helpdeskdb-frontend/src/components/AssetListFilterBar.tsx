import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AssetVisibility } from "@/types/domain/IAssetViewModels";
import { ITag } from "@/types/domain/DomainTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

/**
 * The values a filter can be set to. An empty string / empty array means "no
 * filter" — every dropdown starts with a blank first option.
 */
export interface AssetFilterState {
	category: string;
	owner: string;
	room: string;
	visibility: AssetVisibility | "";
	tagIds: string[];
}

export const emptyAssetFilter = (): AssetFilterState => ({
	category: "",
	owner: "",
	room: "",
	visibility: "",
	tagIds: [],
});

export type SortField = "name" | "added" | "audited";
export type SortDirection = "asc" | "desc";

const VISIBILITIES: AssetVisibility[] = [
	"Normal",
	"Featured",
	"Protected",
	"Archived",
];

const selectWidth = "max-w-[10rem] truncate";

interface AssetListFilterBarProps {
	searchInput: string;
	onSearchChange: (value: string) => void;
	onSearchSubmit: (e: React.SubmitEvent) => void;
	draft: AssetFilterState;
	onDraftChange: (draft: AssetFilterState) => void;
	onApply: () => void;
	onReset: () => void;
	categoryOptions: string[];
	ownerOptions: string[];
	roomOptions: string[];
	tags: ITag[];
	sortField: SortField;
	onSortFieldChange: (field: SortField) => void;
	sortDirection: SortDirection;
	onSortDirectionChange: (direction: SortDirection) => void;
	mode: string;
	onModeChange: (mode: string) => void;
	showActions: boolean;
	createLoading: boolean;
	onCreateAsset: () => void;
}

export default function AssetListFilterBar({
	searchInput,
	onSearchChange,
	onSearchSubmit,
	draft,
	onDraftChange,
	onApply,
	onReset,
	categoryOptions,
	ownerOptions,
	roomOptions,
	tags,
	sortField,
	onSortFieldChange,
	sortDirection,
	onSortDirectionChange,
	mode,
	onModeChange,
	showActions,
	createLoading,
	onCreateAsset,
}: AssetListFilterBarProps) {
	const { t: tCommon } = useTranslation("common");
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");
	const { t: tAssetlistpartial } = useTranslation("_assetlistpartial");

	const [tagMenuOpen, setTagMenuOpen] = useState(false);

	const toggleTag = (tagId: string) => {
		onDraftChange({
			...draft,
			tagIds: draft.tagIds.includes(tagId)
				? draft.tagIds.filter((id) => id !== tagId)
				: [...draft.tagIds, tagId],
		});
	};

	const sortOptions: { value: SortField; label: string }[] = [
		{ value: "name", label: tAssetlistpartial("SortName") },
		{ value: "added", label: tAssetlistpartial("SortAdded") },
		{ value: "audited", label: tAssetlistpartial("Audited") },
	];

	return (
		// One form so Enter in the search submits it, and so Apply/Reset sit in
		// the same row like the reference inventory app's filter form.
		<form
			onSubmit={onSearchSubmit}
			className="mb-4 flex flex-wrap items-center gap-2 bg-white border border-gray-100 rounded-lg shadow-card p-3 text-left"
		>
			{/* Search doubles as the barcode-wedge scan target */}
			<div className="relative flex-1 min-w-[10rem]">
				<Input
					type="text"
					data-barcode-scan-target=""
					aria-label={tCommon("Search")}
					className="w-full pr-8"
					placeholder={tCommon("Search")}
					value={searchInput}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
				<svg
					className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
					/>
				</svg>
			</div>

			{/* Category */}
			<Select
				aria-label={tAssetViewModel("Category")}
				className={selectWidth}
				value={draft.category}
				onChange={(e) =>
					onDraftChange({ ...draft, category: e.target.value })
				}
			>
				<option value="">{tAssetViewModel("Category")}</option>
				{categoryOptions.map((name) => (
					<option key={name} value={name}>
						{name}
					</option>
				))}
			</Select>

			{/* Owner */}
			<Select
				aria-label={tAssetViewModel("Owner")}
				className={selectWidth}
				value={draft.owner}
				onChange={(e) =>
					onDraftChange({ ...draft, owner: e.target.value })
				}
			>
				<option value="">{tAssetViewModel("Owner")}</option>
				{ownerOptions.map((name) => (
					<option key={name} value={name}>
						{name}
					</option>
				))}
			</Select>

			{/* Room */}
			<Select
				aria-label={tAssetViewModel("RoomName")}
				className={selectWidth}
				value={draft.room}
				onChange={(e) =>
					onDraftChange({ ...draft, room: e.target.value })
				}
			>
				<option value="">{tAssetViewModel("RoomName")}</option>
				{roomOptions.map((name) => (
					<option key={name} value={name}>
						{name}
					</option>
				))}
			</Select>

			{/* Tags — multi-select via a checkbox dropdown */}
			<div className="relative">
				<Button
					type="button"
					variant="outline"
					aria-haspopup="listbox"
					aria-expanded={tagMenuOpen}
					onClick={() => setTagMenuOpen(!tagMenuOpen)}
					className="gap-1.5"
				>
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
						/>
					</svg>
					{tCommon("Tags")}
					{draft.tagIds.length > 0 && (
						<span className="bg-brand text-white rounded-full px-1.5 text-xs leading-4">
							{draft.tagIds.length}
						</span>
					)}
				</Button>
				{tagMenuOpen && (
					<>
						<div
							className="fixed inset-0 z-10"
							onClick={() => setTagMenuOpen(false)}
						/>
						<div className="absolute mt-1 z-20 w-56 bg-white border border-gray-200 rounded-md shadow-raised p-2 max-h-60 overflow-y-auto">
							{tags.length === 0 && (
								<div className="px-2 py-1.5 text-sm text-gray-500">
									{tCommon("NoRows")}
								</div>
							)}
							{tags.map((tag) => (
								<label
									key={tag.id}
									className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
								>
									<input
										type="checkbox"
										checked={draft.tagIds.includes(tag.id)}
										onChange={() => toggleTag(tag.id)}
									/>
									{tag.tagName}
								</label>
							))}
						</div>
					</>
				)}
			</div>

			{/* Visibility */}
			<Select
				aria-label={tCommon("Visibility")}
				className={selectWidth}
				value={draft.visibility}
				onChange={(e) =>
					onDraftChange({
						...draft,
						visibility: e.target.value as AssetVisibility | "",
					})
				}
			>
				<option value="">{tCommon("Visibility")}</option>
				{VISIBILITIES.map((visibility) => (
					<option key={visibility} value={visibility}>
						{tCommon(visibility)}
					</option>
				))}
			</Select>

			{/* Sort */}
			<div className="flex items-center gap-1">
				<Select
					aria-label={tAssetlistpartial("SortBy")}
					className={selectWidth}
					value={sortField}
					onChange={(e) =>
						onSortFieldChange(e.target.value as SortField)
					}
				>
					{sortOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
				<Button
					type="button"
					variant="outline"
					onClick={() =>
						onSortDirectionChange(
							sortDirection === "asc" ? "desc" : "asc",
						)
					}
					title={
						sortDirection === "asc"
							? tAssetlistpartial("Ascending")
							: tAssetlistpartial("Descending")
					}
					aria-label={
						sortDirection === "asc"
							? tAssetlistpartial("Ascending")
							: tAssetlistpartial("Descending")
					}
					className="px-2"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d={
								sortDirection === "asc"
									? "M5 15l7-7 7 7"
									: "M19 9l-7 7-7-7"
							}
						/>
					</svg>
				</Button>
			</div>

			{/* View mode: table / grid */}
			<div
				className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2"
				role="group"
				aria-label={tAssetlistpartial("TableView")}
			>
				<button
					type="button"
					aria-pressed={mode === "lines"}
					className={`p-2 transition-colors ${
						mode === "lines"
							? "bg-brand text-white"
							: "text-gray-500 hover:bg-gray-100"
					}`}
					onClick={() => onModeChange("lines")}
					title={tAssetlistpartial("TableView")}
					aria-label={tAssetlistpartial("TableView")}
				>
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 5h18M3 12h18M3 19h18"
						/>
					</svg>
				</button>
				<button
					type="button"
					aria-pressed={mode === "cards"}
					className={`p-2 transition-colors ${
						mode === "cards"
							? "bg-brand text-white"
							: "text-gray-500 hover:bg-gray-100"
					}`}
					onClick={() => onModeChange("cards")}
					title={tAssetlistpartial("GridView")}
					aria-label={tAssetlistpartial("GridView")}
				>
					<svg
						className="w-4 h-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
						/>
					</svg>
				</button>
			</div>

			{/* Apply / Reset */}
			<Button type="button" onClick={onApply}>
				{tCommon("Apply")}
			</Button>
			<Button
				type="button"
				variant="outline"
				onClick={() => {
					onDraftChange(emptyAssetFilter());
					onReset();
					setTagMenuOpen(false);
				}}
			>
				{tCommon("Reset")}
			</Button>

			{showActions && (
				<Button
					type="button"
					onClick={onCreateAsset}
					disabled={createLoading}
				>
					{tAssetViewModel("CreateNewAsset")}
				</Button>
			)}
		</form>
	);
}
