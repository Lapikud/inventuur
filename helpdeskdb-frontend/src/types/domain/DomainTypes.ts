import { IDomainId } from "../IDomainId";

// Asset
export interface IAsset extends IDomainId {
	assetName: string;
	comment: string;
	serialNumber?: string | null;
	barcode?: string | null;
}

export interface IAssetAdd {
	assetName: string;
	comment: string;
	serialNumber?: string | null;
	barcode?: string | null;
}

// Asset reservation
//
// Dates are ISO strings, not Date objects: that is what the API sends and what
// JSON can carry. They were typed as Date, which forced every consumer to re-wrap
// with new Date(...) anyway and needed a `toISOString() as unknown as Date` double
// cast on the write path to compile — hiding the mismatch from tsc rather than
// fixing it. Use formatDateTime (src/lib/format.ts) to display them.
export interface IAssetReservation extends IDomainId {
	userId: string;
	assetId: string;
	reservationFrom: string;
	reservationTo: string;
	isReturned: boolean;
}

export interface IAssetReservationAdd {
	userId: string;
	assetId: string;
	reservationFrom: string;
	reservationTo: string;
}

export interface IAssetReservationUpdate {
	assetReservationId: string;
	userId: string;
	assetId: string;
	reservationFrom: string;
	reservationTo: string;
}

// The overview's reserve / change-time payloads carry no userId: HomeController
// reserves for the authenticated caller and explicitly ignores any UserId in the
// body, and ChangeReservationTime 404s unless the caller already owns the row. The
// admin flows on /assetReservations do send userId — they can act for another user.
export type IReserveAssetPayload = Omit<IAssetReservationAdd, "userId">;
export type IChangeReservationTimePayload = Omit<
	IAssetReservationUpdate,
	"userId"
>;

export interface IAssetReservationWithNames extends IAssetReservation {
	assetName: string;
	userName: string;
	isRemoved?: boolean;
}

// Category
export interface ICategory extends IDomainId {
	categoryName: string;
	comment: string;
}

export interface ICategoryAdd {
	categoryName: string;
	comment: string;
}

// Category asset
export interface ICategoryAsset extends IDomainId {
	comment: string;
	categoryId: string;
	assetId: string;
	createdBy: string;
}

export interface ICategoryAssetWithNames extends ICategoryAsset {
	assetName: string;
	categoryName: string;
}

export interface ICategoryAssetAdd {
	comment: string;
	categoryId: string;
	assetId: string;
	createdBy: string;
}

// Cupboard — belongs to a room directly (no junction).
export interface ICupboard extends IDomainId {
	codeName: string;
	roomId: string;
}

export interface ICupboardAdd {
	codeName: string;
	roomId: string;
}

// Location — belongs to a room, optionally to a cupboard in that room
// (direct FKs; the old junction stacks are gone).
export interface ILocation extends IDomainId {
	locationName: string;
	shelfNum: number;
	column: number;
	roomId: string;
	cupboardId: string | null;
}

export interface ILocationAdd {
	locationName: string;
	shelfNum: number;
	column: number;
	roomId: string;
	cupboardId: string | null;
}

// Owner
export interface IOwner extends IDomainId {
	ownerName: string;
	/** First name of the matching user, when one exists; else null. */
	displayName?: string | null;
	comment: string;
}

export interface IOwnerAdd {
	ownerName: string;
	comment: string;
}

// Owner asset
export interface IOwnerAsset extends IDomainId {
	ownerId: string;
	assetId: string;
	createdBy: string;
}

export interface IOwnerAssetWithNames extends IOwnerAsset {
	assetName: string;
	ownerName: string;
}

export interface IOwnerAssetAdd {
	ownerId: string;
	assetId: string;
	createdBy: string;
}

// Removed asset
export interface IRemovedAsset extends IDomainId {
	assetId: string;
	comment: string;
	removedBy: string;
}

export interface IRemovedAssetAdd {
	assetId: string;
	comment: string;
}

export interface IRemovedAssetWithAssetName extends IRemovedAsset {
	assetName: string;
}

// Room
export interface IRoom extends IDomainId {
	roomName: string;
	comment: string;
}

export interface IRoomAdd {
	roomName: string;
	comment: string;
}

// User asset
export interface IUserAsset extends IDomainId {
	comment: string;
	userId: string;
	assetId: string;
	createdBy: string;
}

export interface IUserAssetWithNames extends IUserAsset {
	assetName: string;
	userName: string;
}

export interface IUserAssetAdd {
	userId: string;
	assetId: string;
}

// User
export interface IUser extends IDomainId {
	username: string;
	/** First name from IPA; null when IPA has none (then show username). */
	displayName?: string | null;
}

export interface IUserWithRoles extends IUser {
	roles: string[];
}

// Role
export interface IRole extends IDomainId {
	name: string;
}

export interface IRoleAdd {
	name: string;
}

// Tag
export interface ITag extends IDomainId {
	tagName: string;
}

export interface ITagAdd {
	tagName: string;
}

// User role
export interface IUserRole extends IDomainId {
	roleId: string;
	userId: string;
}

export interface IUserRoleAdd {
	roleId: string;
	userId: string;
}

export interface IUserRoleWithUsernameAndRoleName extends IUserRole {
	username: string;
	rolename: string;
}

// Refresh token
// Dates are ISO strings — see the note on IAssetReservation.
export interface IRefreshToken extends IDomainId {
	userId: string;
	refreshToken: string;
	previousRefreshToken: string;
	expiration: string;
	previousExpiration: string;
}

export interface IRefreshTokenWithUsername extends IRefreshToken {
	username: string;
}
