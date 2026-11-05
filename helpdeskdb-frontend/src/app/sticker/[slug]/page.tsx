"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { publicAssetService } from "@/services/PublicAssetService";
import { formatDate } from "@/lib/format";
import Spinner from "@/components/LoadingSpinner";

/**
 * The printable QR sticker for a slug'ed asset. Authenticated like every
 * other page (AuthGuard's default), but the data comes from the anonymous
 * public endpoint: it only serves Normal/Featured assets, so a Protected or
 * Archived asset 404s and gets the friendly notice instead.
 */
export default function Sticker() {
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");
	const { t: tAssetlistpartial } = useTranslation("_assetlistpartial");

	const params = useParams<{ slug: string }>();
	const slug = typeof params?.slug === "string" ? params.slug : null;

	const assetQuery = useQuery({
		queryKey: ["publicAsset", slug ?? ""],
		queryFn: () => publicAssetService.getBySlug(slug!),
		enabled: !!slug,
		retry: false,
	});

	if (assetQuery.isLoading) {
		return <Spinner className="h-64" />;
	}

	if (assetQuery.isError) {
		return (
			<div className="min-h-screen bg-surface px-6 py-8 sm:px-14 text-left">
				<div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-card p-8 text-center">
					<h1 className="text-xl font-bold text-ink">
						{tAssetlistpartial("ProtectedAssetNotice")}
					</h1>
				</div>
			</div>
		);
	}

	const asset = assetQuery.data!;

	return (
		<div className="min-h-screen bg-surface px-6 py-8 sm:px-14 text-left print:bg-white">
			<div className="max-w-md mx-auto">
				{/* Everything outside the card is print-only decoration; the
				    @media print block in globals.css hides it. */}
				<div className="flex justify-end mb-4 print:hidden">
					<button
						type="button"
						onClick={() => window.print()}
						className="bg-brand hover:bg-brand-hover text-white font-medium px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors duration-150"
					>
						{tAssetlistpartial("PrintSticker")}
					</button>
				</div>
				<div
					id="sticker-card"
					className="bg-white rounded-2xl shadow-card p-8 text-center"
				>
					{/* The QR endpoint 404s until a slug is assigned, and the
					    request rides the same-origin auth cookies, so a plain
					    img src is enough. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={`/api/v1/assets/${asset.id}/qr`}
						alt={asset.slug}
						className="w-56 h-56 mx-auto"
					/>
					<p className="mt-2 font-mono text-sm text-gray-600 break-all">
						{asset.slug}
					</p>
					<h1 className="mt-4 font-bold text-2xl text-gray-800 break-words">
						{asset.assetName}
					</h1>
					<p className="mt-1 text-gray-600">
						{asset.categoryName}
					</p>
					<p className="mt-1 text-gray-600">
						{asset.roomName && asset.cupboardName
							? `${asset.roomName} ${asset.cupboardName}, ${tAssetViewModel("ShelfNum")} ${asset.shelfNum}, ${tAssetViewModel("Column")} ${asset.column}`
							: "-"}
					</p>
					{asset.lastAuditAt && (
						<p className="mt-1 text-gray-500 text-sm">
							{tAssetViewModel("LastAudited")}:{" "}
							{formatDate(asset.lastAuditAt)}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
