import axios from "axios";
import {
	IPublicAssetSummary,
	IPublicAssetViewModel,
} from "@/types/domain/IAssetViewModels";

/**
 * The anonymous public asset pages (under /a/[slug], also used by the sticker
 * page for Normal/Featured assets).
 *
 * Deliberately NOT built on BaseService: its 401 interceptor would try to
 * rotate the refresh token and hard-redirect to /login — fatal on a page that
 * must render for anonymous visitors. These endpoints are AllowAnonymous and a
 * plain axios instance sends no auth handling beyond the same-origin cookies.
 */
const publicAxios = axios.create({
	baseURL: "/api/v1/",
	withCredentials: true,
});

export class PublicAssetService {
	async list(): Promise<IPublicAssetSummary[]> {
		const response = await publicAxios.get<IPublicAssetSummary[]>(
			"public/assets",
		);
		return response.data;
	}

	async getBySlug(slug: string): Promise<IPublicAssetViewModel> {
		const response = await publicAxios.get<IPublicAssetViewModel>(
			`public/assets/${slug}`,
		);
		return response.data;
	}
}

export const publicAssetService = new PublicAssetService();
