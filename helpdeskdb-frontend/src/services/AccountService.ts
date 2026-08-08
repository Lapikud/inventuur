import { AxiosError } from "axios"
import { BaseService } from "./BaseService"
import { handleServiceError } from "./errors"
import { IResultObject } from "@/types/IResultObject"
import { IIdentityResponse } from "@/types/IIdentityResponse"

export class AccountService extends BaseService {

	// Returns a result rather than void: a failed logout leaves hd_jwt/hd_rt valid and the
	// refresh-token row in the DB, so the caller must NOT clear the identity and navigate as
	// though the user were signed out — on a shared machine that hands the session to whoever
	// sits down next. console.error, not console.log: removeConsole strips log in production.
	async logoutAsync(): Promise<IResultObject<void>> {
		try {
			const response = await this.axiosInstance.post('account/logout', null);
			if (response.status < 300) {
				return { statusCode: response.status };
			}
			return {
				statusCode: response.status,
				errors: [(response.status.toString() + ' ' + response.statusText).trim()],
			}
		} catch (error) {
			return handleServiceError(error, "AccountService.logout");
		}
	}

	async loginAsync(username: string, password: string): Promise<IResultObject<IIdentityResponse>> {
		const url = 'account/login'
		try {
			const loginData = { username, password }

			const response = await this.axiosInstance.post<IIdentityResponse>(
				url,
				loginData
			)

			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data
				}
			}
			return {
				statusCode: response.status,
				errors: [(response.status.toString() + ' ' + response.statusText).trim()],
			}
		} catch (error) {
			return {
				statusCode: (error as AxiosError)?.response?.status ?? (error as AxiosError)?.status,
				errors: [(error as AxiosError).code ?? ""],
			}
		}
	}

	async meAsync(): Promise<IResultObject<IIdentityResponse>> {
		try {
			const response = await this.axiosInstance.get<IIdentityResponse>('account/me')
			if (response.status < 300) {
				return {
					statusCode: response.status,
					data: response.data
				}
			}
			return {
				statusCode: response.status,
				errors: [(response.status.toString() + ' ' + response.statusText).trim()],
			}
		} catch (error) {
			return {
				statusCode: (error as AxiosError)?.response?.status ?? (error as AxiosError)?.status,
				errors: [(error as AxiosError).code ?? ""],
			}
		}
	}
}
