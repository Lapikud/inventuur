"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { publicAssetService } from "@/services/PublicAssetService";
import { formatDate } from "@/lib/format";
import Spinner from "@/components/LoadingSpinner";

/**
 * The anonymous public asset page — the QR sticker landing target. No auth:
 * the route skips AuthGuard's gate (its "a" segment is public) and the layout
 * hides the Header/Footer here, so the page works for any visitor.
 */
export default function PublicAsset() {
	const { t: tCommon } = useTranslation("common");
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");
	const { t: tAssetlistpartial } = useTranslation("_assetlistpartial");

	const params = useParams<{ slug: string }>();
	const slug = typeof params?.slug === "string" ? params.slug : null;

	// Not routed through the app's invalidation key factory: the payload is
	// anonymous and cached per slug, never invalidated by user mutations.
	const assetQuery = useQuery({
		queryKey: ["publicAsset", slug ?? ""],
		queryFn: () => publicAssetService.getBySlug(slug!),
		enabled: !!slug,
		// The only realistic failure is a 404 (unknown/private slug) — retrying
		// would just make the friendly state slower to appear.
		retry: false,
	});

	if (assetQuery.isLoading) {
		return <Spinner className="h-64" />;
	}

	if (assetQuery.isError) {
		return (
			<div className="min-h-screen bg-surface px-6 py-8 sm:px-14 text-left">
				<div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-card p-8 text-center">
					<svg
						className="w-12 h-12 mx-auto text-gray-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m3.3 7 8.7 5 8.7-5M12 22V12"
						/>
					</svg>
					<h1 className="mt-4 text-xl font-bold text-ink">
						{tAssetViewModel("PublicAssetNotFound")}
					</h1>
				</div>
			</div>
		);
	}

	const asset = assetQuery.data!;

	const detailRow = (label: string, value: string) => (
		<div key={label} className="flex items-baseline gap-3">
			<span className="font-medium text-gray-700 min-w-[120px]">
				{label}:
			</span>
			<span className="break-words flex-1 text-gray-600">{value}</span>
		</div>
	);

	const location =
		asset.roomName && asset.cupboardName
			? `${asset.roomName} ${asset.cupboardName}, ${tAssetViewModel("ShelfNum")} ${asset.shelfNum}, ${tAssetViewModel("Column")} ${asset.column}`
			: null;

	return (
		<div className="min-h-screen bg-surface px-6 py-8 sm:px-14 text-left">
			<div className="max-w-md mx-auto bg-white rounded-2xl shadow-card overflow-hidden">
				{asset.hasPhoto ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={`/api/v1/public/assets/${asset.slug}/photo`}
						alt={asset.assetName}
						className="w-full h-56 object-cover bg-field"
					/>
				) : (
					<div className="w-full h-56 bg-field flex items-center justify-center">
						<svg
							className="w-16 h-16 text-gray-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m3.3 7 8.7 5 8.7-5M12 22V12"
							/>
						</svg>
					</div>
				)}
				<div className="p-6">
					<h1 className="font-bold text-2xl text-gray-800 mb-2 break-words">
						{asset.assetName}
					</h1>
					<span className="inline-block bg-surface text-gray-700 text-xs px-2.5 py-1 rounded-full mb-2">
						{tCommon(asset.visibility)}
					</span>
					{asset.inUse && (
						<span className="inline-block bg-warning-soft/15 text-warning-soft text-xs font-medium px-2.5 py-1 rounded-full mb-2 ml-2">
							{tAssetViewModel("InUse")}
						</span>
					)}
					{asset.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-4">
							{asset.tags.map((tagName) => (
								<span
									key={tagName}
									className="bg-surface text-gray-700 text-xs px-2 py-0.5 rounded-full"
								>
									{tagName}
								</span>
							))}
						</div>
					)}
					<div className="space-y-3">
						{detailRow(
							tAssetViewModel("Category"),
							asset.categoryName,
						)}
						{detailRow(
							tAssetViewModel("SerialNumber"),
							asset.serialNumber || "-",
						)}
						{detailRow(
							tAssetViewModel("Location"),
							location ?? tAssetViewModel("DetailsLoginFor"),
						)}
						{detailRow(
							tAssetViewModel("LastAudited"),
							asset.lastAuditAt
								? formatDate(asset.lastAuditAt)
								: tAssetlistpartial("AuditNever"),
						)}
						{detailRow(
							tCommon("Comment"),
							asset.comment ?? tAssetViewModel("DetailsLoginFor"),
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
