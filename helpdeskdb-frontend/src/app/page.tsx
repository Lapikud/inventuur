"use client";

import { useContext } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Overview from "./overview/page";
import { AccountContext } from "@/context/AccountContext";
import { publicAssetService } from "@/services/PublicAssetService";
import Spinner from "@/components/LoadingSpinner";

/**
 * The main page is audience-aware: logged-in members land on the full overview,
 * anonymous visitors get the lean public inventory table (k6.ee-style — names,
 * categories, tags and in-use status; location, ownership and comments need
 * a session and are served per /a/[slug] accordingly).
 */
export default function Home() {
	const { accountInfo } = useContext(AccountContext);

	if (accountInfo === undefined) {
		return <Spinner className="h-64" />;
	}

	if (accountInfo?.id) {
		return <Overview />;
	}

	return <PublicInventory />;
}

function PublicInventory() {
	const { t: tAssetViewModel } = useTranslation("assetviewmodel");

	const assetsQuery = useQuery({
		queryKey: ["publicAssets"],
		queryFn: () => publicAssetService.list(),
	});

	if (assetsQuery.isLoading) {
		return <Spinner className="h-64" />;
	}

	const assets = assetsQuery.data ?? [];

	return (
		<div className="max-w-5xl mx-auto text-left py-8">
			<h1 className="text-2xl font-bold text-ink mb-1 px-4">
				{tAssetViewModel("PublicInventory")}
			</h1>
			<p className="text-sm text-gray-500 mb-6 px-4">
				{tAssetViewModel("LoginForDetails")}
			</p>
			{assets.length === 0 ? (
				<div className="text-center py-10 text-gray-500 px-4">
					{tAssetViewModel("PublicInventoryEmpty")}
				</div>
			) : (
				<div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-card">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-surface text-xs text-gray-500 uppercase border-b border-black/5">
								<th className="text-left font-medium px-4 py-3">
									{tAssetViewModel("AssetName")}
								</th>
								<th className="text-left font-medium px-4 py-3 hidden sm:table-cell">
									{tAssetViewModel("Category")}
								</th>
								<th className="text-left font-medium px-4 py-3 hidden md:table-cell">
									{tAssetViewModel("Tags")}
								</th>
								<th className="text-left font-medium px-4 py-3">
									{tAssetViewModel("InUse")}
								</th>
							</tr>
						</thead>
						<tbody>
							{assets.map((asset) => (
								<tr
									key={asset.id}
									className="border-b border-black/5 last:border-0 hover:bg-surface/60 transition-colors motion-reduce:transition-none"
								>
									<td className="px-4 py-3">
										<Link
											href={`/a/${asset.slug}`}
											className="font-medium text-link hover:text-link-soft"
										>
											{asset.assetName}
										</Link>
										{asset.tags.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-1 sm:hidden">
												{asset.tags.map((tag) => (
													<span
														key={tag}
														className="bg-surface text-gray-600 text-xs px-2 py-0.5 rounded-full"
													>
														{tag}
													</span>
												))}
											</div>
										)}
									</td>
									<td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
										{asset.categoryName}
									</td>
									<td className="px-4 py-3 hidden md:table-cell">
										<div className="flex flex-wrap gap-1">
											{asset.tags.map((tag) => (
												<span
													key={tag}
													className="bg-surface text-gray-600 text-xs px-2 py-0.5 rounded-full"
												>
													{tag}
												</span>
											))}
										</div>
									</td>
									<td className="px-4 py-3">
										{asset.inUse ? (
											<span className="text-warning-soft font-medium">
												{tAssetViewModel("InUse")}
											</span>
										) : (
											<span className="text-success font-medium">-</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
