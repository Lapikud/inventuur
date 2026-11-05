import { IAsset, IAssetAdd } from "@/types/domain/DomainTypes";
import { EntityService } from "./EntityService";
import { IResultObject } from "@/types/IResultObject";

export class AssetService extends EntityService<IAsset, IAssetAdd> {
	constructor() {
		super("assets");
	}

	async getAllAsync(
		includeRemoved: boolean = false,
	): Promise<IResultObject<IAsset[]>> {
		try {
			const response = await this.axiosInstance.get<IAsset[]>(
				this.basePath,
				{
					params: { includeRemoved },
				},
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: response.data };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}
	async getAssetNameById(assetId: string): Promise<string> {
		try {
			const response = await this.getAsync(assetId);
			if (!response.data) {
				console.error("Error getting asset:", response.errors);
				return "Unknown Asset";
			}
			return response.data.assetName;
		} catch (error) {
			console.error("Error fetching asset name:", error);
			return "Unknown Asset";
		}
	}

	async auditAsync(id: string): Promise<IResultObject<IAsset>> {
		try {
			const response = await this.axiosInstance.post<IAsset>(
				`${this.basePath}/${id}/audit`,
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: response.data };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	/**
	 * An empty/null slug asks the backend to auto-generate a random one.
	 */
	async updateSlugAsync(
		id: string,
		slug: string | null,
	): Promise<IResultObject<IAsset>> {
		try {
			const response = await this.axiosInstance.put<IAsset>(
				`${this.basePath}/${id}/slug`,
				{ slug },
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: response.data };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	/**
	 * Full sync of an asset's tags — an empty array clears them.
	 */
	async updateTagsAsync(
		id: string,
		tagIds: string[],
	): Promise<IResultObject<null>> {
		try {
			const response = await this.axiosInstance.put(
				`${this.basePath}/${id}/tags`,
				{ tagIds },
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: null };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async uploadPhotoAsync(id: string, file: File): Promise<IResultObject<null>> {
		try {
			const formData = new FormData();
			formData.append("file", file);
			// The XHR adapter drops the JSON default for FormData bodies so the
			// browser can set multipart/form-data with the boundary itself.
			const response = await this.axiosInstance.put(
				`${this.basePath}/${id}/photo`,
				formData,
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: null };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async deletePhotoAsync(id: string): Promise<IResultObject<null>> {
		try {
			const response = await this.axiosInstance.delete(
				`${this.basePath}/${id}/photo`,
			);
			if (response.status < 300) {
				return { statusCode: response.status, data: null };
			}
			return {
				statusCode: response.status,
				errors: [`${response.status} ${response.statusText}`.trim()],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}
}
