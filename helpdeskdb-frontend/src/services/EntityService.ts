import { IResultObject } from "@/types/IResultObject";
import { BaseService } from "./BaseService";
import { handleServiceError } from "./errors";
import { IDomainId } from "@/types/IDomainId";

export abstract class EntityService<
	TEntity extends IDomainId,
	TAddEntity,
> extends BaseService {
	constructor(protected basePath: string) {
		super();
	}

	async getAllAsync(): Promise<IResultObject<TEntity[]>> {
		try {
			const response = await this.axiosInstance.get<TEntity[]>(
				this.basePath,
			);

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data,
				};
			}

			return {
				statusCode: response.status,
				errors: [
					(
						response.status.toString() +
						" " +
						response.statusText
					).trim(),
				],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async getAsync(id: string): Promise<IResultObject<TEntity>> {
		try {
			const response = await this.axiosInstance.get<TEntity>(
				this.basePath + "/" + id,
			);

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data,
				};
			}

			return {
				statusCode: response.status,
				errors: [
					(
						response.status.toString() +
						" " +
						response.statusText
					).trim(),
				],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async deleteAsync(id: string): Promise<IResultObject<null>> {
		try {
			const response = await this.axiosInstance.delete<null>(
				this.basePath + "/" + id,
			);

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: null,
				};
			}

			return {
				statusCode: response.status,
				errors: [
					(
						response.status.toString() +
						" " +
						response.statusText
					).trim(),
				],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async addAsync(entity: TAddEntity): Promise<IResultObject<TEntity>> {
		try {
			const response = await this.axiosInstance.post<TEntity>(
				this.basePath,
				entity,
			);

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data,
				};
			}

			return {
				statusCode: response.status,
				errors: [
					(
						response.status.toString() +
						" " +
						response.statusText
					).trim(),
				],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async updateAsync(entity: TEntity): Promise<IResultObject<TEntity>> {
		try {
			const response = await this.axiosInstance.put<TEntity>(
				this.basePath + "/" + entity.id,
				entity,
			);

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data,
				};
			}

			return {
				statusCode: response.status,
				errors: [
					(
						response.status.toString() +
						" " +
						response.statusText
					).trim(),
				],
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	protected handleError<T>(error: unknown): IResultObject<T> {
		return handleServiceError(error, "EntityService");
	}
}
