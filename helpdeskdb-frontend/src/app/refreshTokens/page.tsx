"use client";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useRefreshTokens, useUsers } from "@/hooks/queries/entityQueries";
import { IRefreshTokenWithUsername } from "@/types/domain/DomainTypes";
import ListPageWrapper from "@/components/ListPageWrapper";
import DataTable from "@/components/DataTable";
import ErrorBanner from "@/components/ErrorBanner";

export default function RefreshTokens() {
	const { t: tRefreshToken } = useTranslation("refreshtoken");

	const { data: tokens, error } = useRefreshTokens();
	const { data: users } = useUsers();

	const data: IRefreshTokenWithUsername[] = useMemo(() => {
		if (!tokens) return [];

		const userById = new Map((users ?? []).map((u) => [u.id, u.username]));

		return tokens.map((token) => ({
			...token,
			username: userById.get(token.userId) ?? token.userId,
		}));
	}, [tokens, users]);

	const columns = [
		tRefreshToken("User"),
		tRefreshToken("RefreshToken"),
		tRefreshToken("Expiration"),
		tRefreshToken("PreviousRefreshToken"),
		tRefreshToken("PreviousExpiration"),
	];

	const rows = data.map((item) => ({
		id: item.id,
		cells: [
			item.username,
			item.refreshToken,
			new Date(item.expiration).toLocaleString(),
			item.previousRefreshToken || "-",
			item.previousExpiration
				? new Date(item.previousExpiration).toLocaleString()
				: "-",
		],
	}));

	return (
		<ListPageWrapper title={tRefreshToken("RefreshTokensTitle")}>
			<ErrorBanner error={error} variant="page" />
			<DataTable
				columns={columns}
				rows={rows}
				minWidth="min-w-[1100px]"
			/>
		</ListPageWrapper>
	);
}
