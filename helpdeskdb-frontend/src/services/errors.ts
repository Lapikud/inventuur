import { AxiosError, AxiosResponse } from "axios";
import { IResultObject } from "@/types/IResultObject";

/**
 * Error thrown by `unwrap` when a service call fails.
 *
 * Services return `IResultObject` and never throw, but React Query decides
 * success/failure by whether the promise rejects — so failures have to be
 * converted into rejections. `statusCode` is carried through so the query
 * client can skip retries on 4xx (the 401 interceptor in BaseService already
 * owns token refresh; retrying would fight it).
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly errors: string[],
	) {
		super(message);
		this.name = "ApiError";
	}
}

/**
 * Converts a thrown axios error into an `IResultObject` failure.
 *
 * Every service's catch block funnels through here so error banners show what the
 * backend actually said. The shapes checked are the three the API emits: a
 * `messages` array (validation), or a single `message`/`Message` (the `Message`
 * record type used by the overview endpoints).
 *
 * `statusCode` prefers `response.status` over `AxiosError.status`: on a network
 * failure the latter is undefined, and falling through to 0 would make the
 * retry predicate in providers.tsx treat a 4xx as retryable.
 */
export function handleServiceError<T>(
	error: unknown,
	context = "Service",
): IResultObject<T> {
	const axiosErr = error as AxiosError;
	console.error(`${context} error:`, axiosErr.message);

	const response = axiosErr.response as
		| AxiosResponse<{
				messages?: string[];
				message?: string;
				Message?: string;
		  }>
		| undefined;
	const serverMessages = response?.data?.messages;
	const serverMessage = response?.data?.Message || response?.data?.message;

	return {
		statusCode: response?.status ?? axiosErr.status ?? 0,
		errors: serverMessages?.length
			? serverMessages
			: serverMessage
				? [serverMessage]
				: [axiosErr.message ?? axiosErr.code ?? "UNKNOWN_ERROR"],
	};
}

/** Best-effort human-readable message from an unknown thrown value. */
export function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/** Unwraps an `IResultObject` into its data, throwing `ApiError` on failure. */
export async function unwrap<T>(promise: Promise<IResultObject<T>>): Promise<T> {
	const result = await promise;

	if (result.errors?.length || (result.statusCode ?? 0) >= 400) {
		throw new ApiError(
			result.errors?.join(", ") || "Request failed",
			result.statusCode ?? 0,
			result.errors ?? [],
		);
	}

	return result.data as T;
}
