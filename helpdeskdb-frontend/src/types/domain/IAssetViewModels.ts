import { IDomainId } from "../IDomainId";

export type AssetVisibility = "Normal" | "Featured" | "Protected" | "Archived";

export interface IAssetViewModel extends IDomainId {
	assetName: string;
	serialNumber: string | null;
	barcode: string | null;
	categoryName: string;
	ownerName: string;
	roomName: string;
	cupboardName: string;
	shelfNum: number;
	column: number;
	/** The asset's direct placement FK; set via the edit dialog's location select. */
	locationId: string | null;
	closestReservationBy: string;
	addedAt: string; // ISO string
	reservationId: string | null;
	reservationTo: string | null;
	reserved: boolean;
	slug: string | null;
	visibility: AssetVisibility;
	hasPhoto: boolean;
	lastAuditAt: string | null; // ISO string
	lastAuditBy: string | null;
	tags: string[]; // tag names
	comment: string | null;
}

/**
 * The anonymous public view served by public/assets/{slug}. Deliberately
 * narrower than IAssetViewModel: no owner, reservation, or audit-by info —
 * only what a visitor scanning the QR sticker may see.
 */
export interface IPublicAssetViewModel {
	id: string;
	slug: string;
	assetName: string;
	/** null for anonymous visitors — location is members-only. */
	comment: string | null;
	serialNumber: string | null;
	categoryName: string;
	/** Location fields are null when the request has no valid session. */
	roomName: string | null;
	cupboardName: string | null;
	shelfNum: number | null;
	column: number | null;
	tags: string[]; // tag names
	hasPhoto: boolean;
	/** True when someone holds a reservation on the asset — holder name never public. */
	inUse: boolean;
	lastAuditAt: string | null; // ISO string
	visibility: AssetVisibility;
}

/** Lean anonymous listing row behind the public main page. */
export interface IPublicAssetSummary {
	id: string;
	slug: string;
	assetName: string;
	categoryName: string;
	tags: string[];
	hasPhoto: boolean;
	inUse: boolean;
	visibility: AssetVisibility;
}

export interface IAssetsOverviewViewModel {
	availableAssets: IAssetViewModel[];
	assetsReservedByUser: IAssetViewModel[];
}

export interface IAssetViewModelCreate {
	assetName: string;
	comment: string;
	serialNumber?: string | null;
	barcode?: string | null;
	selectedCategoryId: string;
	selectedOwnerId: string;
	selectedLocationId: string;
}

export interface IAssetViewModelUpdate {
	assetId: string;
	assetName: string;
	comment: string;
	serialNumber?: string | null;
	barcode?: string | null;
	selectedCategoryId: string;
	selectedOwnerId: string;
	selectedLocationId: string;
	categoryAssetsId: string | null;
	ownerAssetsId: string | null;
}

export interface IAssetViewModelRemove {
	assetId: string;
	comment: string;
}
