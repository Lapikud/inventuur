/**
 * Central query-key factory.
 *
 * Keys are the cache addresses React Query uses for deduplication and
 * invalidation, so they must be constructed in exactly one place — a typo in an
 * inline key silently creates a second cache entry instead of failing loudly.
 *
 * Any parameter that changes the response must appear in the key. Note
 * `assets(includeRemoved)`: `AssetService.getAllAsync` takes that flag, and the
 * two variants return different lists, so they need distinct entries.
 */
export const qk = {
	// Prefix key for invalidation: matches both `includeRemoved` variants and
	// per-id entries in one call.
	assetsRoot: () => ["assets"] as const,
	assets: (includeRemoved = false) =>
		["assets", { includeRemoved }] as const,
	asset: (id: string) => ["assets", id] as const,

	// Prefix key for invalidation: matches the list and per-id entries in one
	// call. The list key carries a "list" discriminator so invalidating it
	// doesn't prefix-match (and refetch) per-id entries.
	assetReservationsRoot: () => ["assetReservations"] as const,
	assetReservations: () => ["assetReservations", "list"] as const,
	assetReservation: (id: string) => ["assetReservations", id] as const,
	categories: () => ["categories"] as const,
	categoryAssets: () => ["categoryAssets"] as const,
	categoryAssetByAsset: (assetId: string) =>
		["categoryAssets", "byAsset", assetId] as const,
	cupboards: () => ["cupboards"] as const,
	locations: () => ["locations"] as const,
	// Prefix key for invalidation: matches every searchTerm variant at once, so
	// a mutation doesn't have to know which search the user is currently on.
	overviewRoot: () => ["overview"] as const,
	overview: (searchTerm: string) => ["overview", searchTerm] as const,
	ownerAssets: () => ["ownerAssets"] as const,
	ownerAssetByAsset: (assetId: string) =>
		["ownerAssets", "byAsset", assetId] as const,
	owners: () => ["owners"] as const,
	refreshTokens: () => ["refreshTokens"] as const,
	removedAssets: () => ["removedAssets"] as const,
	roles: () => ["roles"] as const,
	rooms: () => ["rooms"] as const,
	tags: () => ["tags"] as const,
	userRoles: () => ["userRoles"] as const,
	users: () => ["users"] as const,
} as const;

/**
 * Every cache a write to an *asset* invalidates.
 *
 * An asset write also touches its category/owner mapping rows and can move the
 * asset in or out of the removed list, so all of those go stale together.
 * (Placement is a direct location FK on the asset — the locationAssets
 * junction is gone.) Shared by the overview page and /dbassets, which
 * previously disagreed: /dbassets invalidated only the asset and overview
 * lists, leaving the mapping pages caching rows that pointed at a deleted
 * assetId — and those pages fall back to rendering the raw GUID.
 */
export const assetWriteKeys = () => [
	qk.overviewRoot(),
	qk.assetsRoot(),
	qk.removedAssets(),
	qk.categoryAssets(),
	qk.ownerAssets(),
];
