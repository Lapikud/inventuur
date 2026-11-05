export interface IIdentityResponse {
	id: string;
	username: string;
	/** First name from IPA; shown instead of the username when set. */
	displayName?: string | null;
	roles: string[];
}
