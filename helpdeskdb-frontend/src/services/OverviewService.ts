import { BaseService } from "./BaseService";
import { handleServiceError } from "./errors";
import {
	IAssetViewModel,
	IAssetsOverviewViewModel,
	IAssetViewModelCreate,
	IAssetViewModelUpdate,
	IAssetViewModelRemove,
} from "@/types/domain/IAssetViewModels";
import { IResultObject } from "@/types/IResultObject";
import {
	IChangeReservationTimePayload,
	IReserveAssetPayload,
} from "@/types/domain/DomainTypes";

export class OverviewService extends BaseService {
	constructor() {
		super();
	}

	async getOverview(
		searchTerm?: string,
	): Promise<IResultObject<IAssetsOverviewViewModel>> {
		try {
			const response =
				await this.axiosInstance.get<IAssetsOverviewViewModel>(
					"home/overview",
					{
						params: searchTerm ? { searchTerm } : {},
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

	async createAsset(
		data: IAssetViewModelCreate,
	): Promise<IResultObject<IAssetViewModel>> {
		try {
			const response = await this.axiosInstance.post<IAssetViewModel>(
				"home/overview/createNewAsset",
				data,
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

	async updateAsset(
		id: string,
		data: IAssetViewModelUpdate,
	): Promise<IResultObject<null>> {
		try {
			const response = await this.axiosInstance.put(
				`home/overview/edit/${id}`,
				data,
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

	async removeAsset(
		id: string,
		data: IAssetViewModelRemove,
	): Promise<IResultObject<{ message: string }>> {
		try {
			const response = await this.axiosInstance.post<{ message: string }>(
				`home/overview/remove/${id}`,
				data,
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

	async reserveAsset(
		id: string,
		data: IReserveAssetPayload,
	): Promise<IResultObject<{ message: string }>> {
		try {
			const response = await this.axiosInstance.post<{ message: string }>(
				`home/overview/reserve/${id}`,
				data,
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

	async changeReservationTime(
		reservationId: string,
		data: IChangeReservationTimePayload,
	): Promise<IResultObject<null>> {
		try {
			const response = await this.axiosInstance.put(
				`home/overview/changeReservationTime/${reservationId}`,
				data,
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

	async removeReservation(
		id: string,
	): Promise<IResultObject<{ message: string }>> {
		try {
			const response = await this.axiosInstance.post<{ message: string }>(
				`home/overview/remove-reservation/${id}`,
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

	async returnAsset(
		id: string,
	): Promise<IResultObject<{ message: string }>> {
		try {
			const response = await this.axiosInstance.post<{ message: string }>(
				`home/overview/return/${id}`,
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

	private handleError<T>(error: unknown): IResultObject<T> {
		return handleServiceError(error, "OverviewService");
	}
}
