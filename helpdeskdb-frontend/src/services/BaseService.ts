import { IAccountInfo } from "@/context/AccountContext";
import { IIdentityResponse } from "@/types/IIdentityResponse";
import axios, { AxiosInstance } from "axios";

// Shared across every service instance so concurrent 401s trigger only ONE
// refresh-token rotation. Without this, two services hitting a 401 at the same
// time both call renewRefreshToken, the backend rotates the hd_rt cookie on the
// first, and the second presents an already-invalidated token, fails, and logs
// the user out.
let sharedRefresh: Promise<IIdentityResponse | null> | null = null;

export abstract class BaseService {
	protected axiosInstance: AxiosInstance;

	private setAccountInfo?: (value: IAccountInfo) => void;

	public injectSetAccountInfo(fn: (value: IAccountInfo) => void) {
		this.setAccountInfo = fn;
	}

	/**
	 * Drops the local identity and sends the user to the public main page.
	 * Called from every path where the session has proven unrecoverable — a
	 * failed refresh, a refresh that returned no identity, and a replayed
	 * request that 401'd again. Each of those used to reject silently,
	 * stranding the UI on a page that looked signed in. The public page (not
	 * /login — no auto-redirect to the form) keeps the visitor browsing.
	 */
	private endSession() {
		this.setAccountInfo?.({});
		if (
			typeof window !== "undefined" &&
			window.location.pathname !== "/"
		) {
			window.location.href = "/";
		}
	}

	constructor() {
		this.axiosInstance = axios.create({
			baseURL: "/api/v1/",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			withCredentials: true,
		});

		this.axiosInstance.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;
				// A rejection with no config (synthesized by another interceptor, or an
				// aborted request) would make the _retry check below throw a TypeError
				// from inside this error handler, replacing the real error.
				if (!originalRequest) return Promise.reject(error);
				if (
					error.response &&
					error.response.status === 401 &&
					!originalRequest._retry &&
					!originalRequest.url?.includes("account/renewRefreshToken") &&
					!originalRequest.url?.includes("account/login")
				) {
					originalRequest._retry = true;
					try {
						// Coalesce concurrent refreshes onto a single in-flight call.
						if (!sharedRefresh) {
							sharedRefresh = this.axiosInstance
								.post<IIdentityResponse>(
									"account/renewRefreshToken",
									null
								)
								// axios rejects non-2xx responses, so reaching .then means success
								.then((response) => response.data)
								.finally(() => {
									sharedRefresh = null;
								});
						}

						const identity = await sharedRefresh;

						if (identity) {
							this.setAccountInfo?.({
								id: identity.id,
								name: identity.displayName || identity.username,
								roles: identity.roles,
							});
							return this.axiosInstance(originalRequest);
						}

						// Refresh "succeeded" with no identity body. There is no valid
						// session to continue with, so fall through to the sign-out path
						// rather than leaving the UI on an apparently-authenticated page
						// issuing 401s with no route back to /login.
						this.endSession();
						return Promise.reject(error);
					} catch (refreshError) {
						this.endSession();
						return Promise.reject(refreshError);
					}
				}
				// Reaching here with a 401 means the replayed request was rejected too —
				// _retry is per-request, so a cross-tab refresh that rotated hd_rt out
				// from under this tab lands here. Same dead end: sign out.
				if (error.response?.status === 401 && originalRequest._retry) {
					this.endSession();
				}
				return Promise.reject(error);
			}
		);
	}
}
